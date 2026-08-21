import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auditAdmin } from "@/lib/audit";

export async function POST(request: Request) {
  if (!(await isApiAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const body = await request.json();
  const code = String(body.code || "").replace(/[^a-z0-9_-]/gi, "").toUpperCase();
  const kind = body.kind === "fixed" ? "fixed" : "percent";
  const value = Number(body.value);
  if (!code || !Number.isFinite(value) || value <= 0 || (kind === "percent" && value > 100)) return NextResponse.json({ error: "Cupom inválido" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("coupons").insert({ code, kind, value, max_uses: body.max_uses ? Number(body.max_uses) : null, expires_at: body.expires_at || null, event_id: body.event_id || null }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await auditAdmin("create", "coupon", String(data.id), { code, kind, value });
  return NextResponse.json({ success: true });
}
