import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auditAdmin } from "@/lib/audit";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("promotion_settings").select("*").eq("id", true).single();
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const message = String(body.message || "").trim().slice(0, 180);
  const linkUrl = String(body.link_url || "").trim().slice(0, 500) || null;
  if (body.active && !message) return NextResponse.json({ error: "Informe a mensagem." }, { status: 400 });
  if (linkUrl && !/^https?:\/\//i.test(linkUrl) && !linkUrl.startsWith("/")) return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  const values = { id: true, active: Boolean(body.active), message, link_url: linkUrl, link_label: String(body.link_label || "Saiba mais").trim().slice(0, 40), updated_at: new Date().toISOString() };
  const { data, error } = await supabaseAdmin.from("promotion_settings").upsert(values).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await auditAdmin("update", "promotion_settings", "site-banner", { active: values.active });
  return NextResponse.json(data);
}
