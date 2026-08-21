import { NextResponse } from "next/server";
import { calculatePrice } from "@/lib/pricing";
import { applyCoupon } from "@/lib/coupons";

export async function POST(request: Request) {
  try {
    const { code, quantity } = await request.json();
    const base = calculatePrice(Math.max(0, Number(quantity) || 0));
    const result = await applyCoupon(code, base.total);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Cupom inválido" }, { status: 400 });
  }
}
