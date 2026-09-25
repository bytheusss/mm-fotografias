import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasRole } from "@/lib/roles";

const BUCKET = "profile-photos";
const MAX = 20 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

async function photographer() {
  const user = await getApiUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { data: profile } = await supabaseAdmin.from("profiles").select("role,roles,avatar_url").eq("id", user.id).maybeSingle();
  if (!hasRole(profile, ["photographer"])) return { error: NextResponse.json({ error: "Disponível apenas para fotógrafos." }, { status: 403 }) };
  return { user, profile };
}

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { data } = await supabaseAdmin.from("photos").select("id,number,thumbnail_path,events(name,slug)").eq("photographer_id", user.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(60);
  return NextResponse.json({ photos: (data || []).map((photo) => ({ ...photo, thumbnail: supabaseAdmin.storage.from("thumbnails").getPublicUrl(String(photo.thumbnail_path || "").replace(/^thumbnails\//, "")).data.publicUrl })) });
}

export async function POST(request: Request) {
  const auth = await photographer();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => ({}));
  if (body.kind !== "prepare-avatar") return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
  const size = Number(body.size || 0), type = String(body.type || "").toLowerCase();
  if (!size || size > MAX || !ALLOWED.has(type)) return NextResponse.json({ error: "Use JPG, PNG, WebP ou HEIC de até 20 MB." }, { status: 400 });
  const path = `${auth.user.id}/.uploads/${randomUUID()}`;
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
  return error || !data ? NextResponse.json({ error: error?.message || "Não foi possível preparar o envio." }, { status: 500 }) : NextResponse.json({ path, token: data.token });
}

export async function PUT(request: Request) {
  const auth = await photographer();
  if (auth.error) return auth.error;
  const { user, profile } = auth;
  const form = await request.formData();
  let avatarUrl = String(form.get("avatarUrl") || "").trim().slice(0, 500) || profile?.avatar_url || null;
  const avatarPath = String(form.get("avatarPath") || "");
  if (avatarPath) {
    if (!avatarPath.startsWith(`${user.id}/.uploads/`)) return NextResponse.json({ error: "Envio de foto inválido." }, { status: 400 });
    const storage = supabaseAdmin.storage.from(BUCKET);
    const { data: file, error: downloadError } = await storage.download(avatarPath);
    if (downloadError || !file) return NextResponse.json({ error: "A foto não chegou ao armazenamento. Tente novamente." }, { status: 400 });
    try {
      const output = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" }).rotate().resize(800, 800, { fit: "cover", position: "attention" }).webp({ quality: 88 }).toBuffer();
      const finalPath = `${user.id}/avatar.webp`;
      const { error } = await storage.upload(finalPath, output, { contentType: "image/webp", upsert: true, cacheControl: "3600" });
      if (error) throw error;
      await storage.remove([avatarPath]);
      avatarUrl = `${storage.getPublicUrl(finalPath).data.publicUrl}?v=${Date.now()}`;
    } catch (error) {
      await storage.remove([avatarPath]);
      console.error("AVATAR PROCESS ERROR", error);
      return NextResponse.json({ error: "Não foi possível ler essa foto. Exporte-a como JPG ou PNG e tente novamente." }, { status: 400 });
    }
  }
  let featured: string[] = [];
  try { featured = JSON.parse(String(form.get("featuredPhotoIds") || "[]")).slice(0, 12); } catch {}
  const update = { full_name: String(form.get("name") || "").trim().slice(0, 120), bio: String(form.get("bio") || "").trim().slice(0, 500) || null, instagram_handle: String(form.get("instagram") || "").trim().replace(/^@/, "").slice(0, 80) || null, avatar_url: avatarUrl, public_profile: String(form.get("publicProfile")) === "true", public_title: String(form.get("publicTitle") || "").trim().slice(0, 100) || null, public_whatsapp: String(form.get("whatsapp") || "").replace(/\D/g, "").slice(0, 15) || null, availability_text: String(form.get("availability") || "").trim().slice(0, 180) || null, monthly_goal: Math.max(0, Number(form.get("monthlyGoal") || 0)), featured_photo_ids: featured };
  const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", user.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true, avatarUrl });
}
