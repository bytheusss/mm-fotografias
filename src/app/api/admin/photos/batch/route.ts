import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getApiUser } from "@/lib/api-auth";
export async function PATCH(request: Request) {
  const body = await request.json(); const ids = Array.isArray(body.ids) ? body.ids.map(String).slice(0, 200) : [];
  if (!ids.length) return NextResponse.json({ error: "Selecione fotos." }, { status: 400 });
  const values: Record<string, unknown> = {};
  if (body.action === "trash") { values.deleted_at = new Date().toISOString(); values.deleted_by = (await getApiUser())?.id || null; }
  else if (body.action === "restore") { values.deleted_at = null; values.deleted_by = null; }
  else if (body.action === "hide") values.status = "reserved";
  else if (body.action === "publish") values.status = "available";
  else if (body.action === "assign") values.photographer_id = body.photographerId || null;
  else if (body.action === "category") values.category = String(body.category || "Geral").trim().slice(0, 60) || "Geral";
  else if (body.action === "price") { const price=Number(body.price); if(!Number.isFinite(price)||price<0||price>10000)return NextResponse.json({error:"Preço inválido."},{status:400});values.price=Math.round(price*100)/100; }
  else if (body.action === "feature") values.featured = Boolean(body.featured);
  else return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  const { error } = await supabaseAdmin.from("photos").update(values).in("id", ids);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true, count: ids.length });
}
