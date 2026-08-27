import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isOwner } from "@/lib/owner-auth";
import { auditAdmin } from "@/lib/audit";

const manageable = ["client", "photographer", "support", "admin", "owner"];

export async function GET() {
  if (!(await isOwner())) return NextResponse.json({ error: "Somente o proprietário pode gerenciar cargos." }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("profiles").select("id,email,full_name,role,roles,commission_rate,bio,instagram_handle,avatar_url,phone,public_whatsapp,public_profile,created_at").order("created_at");
  const members = (data || []).filter(profile => [profile.role, ...(profile.roles || [])].some((role: string) => ["owner", "admin", "support", "photographer"].includes(role)));
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ members });
}

export async function POST(request: Request) {
  if (!(await isOwner())) return NextResponse.json({ error: "Somente o proprietário pode gerenciar cargos." }, { status: 403 });
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const requested: string[] = Array.isArray(body.roles) ? body.roles.map(String) : [String(body.role || "")];
  const valid = [...new Set(requested.filter((role: string) => manageable.includes(role)))];
  const { data: profile } = await supabaseAdmin.from("profiles").select("id,role,roles").ilike("email", email).maybeSingle();
  if (!profile) return NextResponse.json({ error: "A pessoa precisa criar uma conta primeiro." }, { status: 404 });
  const roles = profile.role === "owner" ? [...new Set(["owner", ...valid])] : (valid.length ? valid : ["client"]);
  const role = profile.role === "owner" ? "owner" : (["owner", "photographer", "admin", "support", "client"].find(item => roles.includes(item)) || "client");
  const commission = Math.min(100, Math.max(0, Number(body.commissionRate || 0)));
  const photographer = roles.includes("photographer");
  const professional = photographer ? {
    bio: String(body.bio || "").slice(0, 500) || null,
    instagram_handle: String(body.instagramHandle || "").replace(/^@/, "").slice(0, 80) || null,
    avatar_url: String(body.avatarUrl || "").slice(0, 500) || null,
    public_profile: Boolean(body.publicProfile),
    phone: String(body.whatsapp || "").replace(/\D/g, "").slice(0, 15) || null,
    public_whatsapp: String(body.whatsapp || "").replace(/\D/g, "").slice(0, 15) || null,
  } : { public_profile: false };
  const { error } = await supabaseAdmin.from("profiles").update({ role, roles, commission_rate: photographer ? commission : 0, ...professional }).eq("id", profile.id);
  if (!error) await auditAdmin("role_change", "profile", profile.id, { roles, email, commission });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
