import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const values: Record<string, unknown> = {};
  if (typeof body.active === "boolean") values.active = body.active;
  if (body.label) values.label = String(body.label).trim();
  if (Number(body.unit_price) > 0) values.unit_price = Number(body.unit_price);
  const { error } = await supabaseAdmin.from("pricing_packages").update(values).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
