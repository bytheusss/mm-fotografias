import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("pricing_packages").select("*").order("min_quantity");
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ packages: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const minQuantity = Math.floor(Number(body.min_quantity));
  const unitPrice = Number(body.unit_price);
  const label = String(body.label || "").trim();
  if (minQuantity < 1 || unitPrice <= 0 || !label) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("pricing_packages").upsert({ min_quantity: minQuantity, unit_price: unitPrice, label, active: body.active !== false }, { onConflict: "min_quantity" }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}
