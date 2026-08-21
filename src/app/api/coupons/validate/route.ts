import { NextResponse } from "next/server";
import { calculatePrice } from "@/lib/pricing";
import { applyCoupon } from "@/lib/coupons";
import { getPricingPackages } from "@/lib/pricing-server";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "coupon"), 30, 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  try {
    const { code, quantity, eventSlugs } = await request.json();
    const base = calculatePrice(Math.max(0, Number(quantity) || 0), await getPricingPackages());
    const result = await applyCoupon(code, base.total, Array.isArray(eventSlugs) ? eventSlugs.map(String) : []);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Cupom inválido" }, { status: 400 });
  }
}
