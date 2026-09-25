import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasRole } from "@/lib/roles";

const BUCKET = "portfolio-assets";
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

async function photographer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role,roles").eq("id", user.id).maybeSingle();
  return hasRole(profile, ["photographer"]) ? user : null;
}

const publicUrl = (path: string) => supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "foto";

export async function GET() {
  const user = await photographer();
  if (!user) return Response.json({ error: "Acesso negado." }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("photographer_portfolio_assets").select("*").eq("photographer_id", user.id).order("sort_order").order("created_at", { ascending: false });
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ assets: (data || []).map((item) => ({ ...item, url: publicUrl(item.storage_path) })) });
}

export async function POST(request: Request) {
  const user = await photographer();
  if (!user) return Response.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const kind = String(body.kind || "");

  if (kind === "prepare") {
    const filename = safeName(String(body.filename || "foto"));
    const size = Number(body.size || 0);
    const type = String(body.type || "").toLowerCase();
    if (!size || size > MAX_BYTES || !ALLOWED_TYPES.has(type)) return Response.json({ error: "Use JPG, PNG, WebP ou HEIC de até 20 MB." }, { status: 400 });
    const path = `${user.id}/.uploads/${randomUUID()}-${filename}`;
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
    if (error || !data) return Response.json({ error: error?.message || "Não foi possível preparar o envio." }, { status: 500 });
    return Response.json({ path, token: data.token });
  }

  if (kind === "finish") {
    const path = String(body.path || "");
    const filename = safeName(String(body.filename || "foto"));
    const category = String(body.category || "Outros").slice(0, 60);
    if (!path.startsWith(`${user.id}/.uploads/`)) return Response.json({ error: "Envio inválido." }, { status: 400 });
    const storage = supabaseAdmin.storage.from(BUCKET);
    const { data: file, error: downloadError } = await storage.download(path);
    if (downloadError || !file) return Response.json({ error: "A foto não chegou ao armazenamento. Tente novamente." }, { status: 400 });
    if (file.size > MAX_BYTES) { await storage.remove([path]); return Response.json({ error: "A foto ultrapassa 20 MB." }, { status: 400 }); }
    try {
      const source = Buffer.from(await file.arrayBuffer());
      const metadata = await sharp(source, { failOn: "error" }).metadata();
      if (!metadata.width || !metadata.height) throw new Error("Imagem sem dimensões válidas");
      const output = await sharp(source, { failOn: "error" }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 86, effort: 4 }).toBuffer();
      const finalPath = `${user.id}/${randomUUID()}.webp`;
      const { error: uploadError } = await storage.upload(finalPath, output, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;
      const { data, error } = await supabaseAdmin.from("photographer_portfolio_assets").insert({ photographer_id: user.id, storage_path: finalPath, title: filename.replace(/\.[^.]+$/, " ").trim().slice(0, 120), category, width: metadata.width, height: metadata.height }).select().single();
      if (error) { await storage.remove([finalPath]); throw error; }
      await storage.remove([path]);
      return Response.json({ asset: { ...data, url: publicUrl(finalPath) } }, { status: 201 });
    } catch (error) {
      await storage.remove([path]);
      console.error("PORTFOLIO PROCESS ERROR", error);
      return Response.json({ error: "Não foi possível ler essa imagem. Exporte-a como JPG ou PNG e tente novamente." }, { status: 400 });
    }
  }
  return Response.json({ error: "Operação inválida." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const user = await photographer();
  if (!user) return Response.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json();
  const changes = { title: String(body.title || "").slice(0, 120), description: String(body.description || "").slice(0, 500), category: String(body.category || "Outros").slice(0, 60), published: Boolean(body.published), sort_order: Number(body.sortOrder) || 0, updated_at: new Date().toISOString() };
  const { error } = await supabaseAdmin.from("photographer_portfolio_assets").update(changes).eq("id", body.id).eq("photographer_id", user.id);
  return error ? Response.json({ error: error.message }, { status: 500 }) : Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await photographer();
  if (!user) return Response.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await request.json();
  const { data } = await supabaseAdmin.from("photographer_portfolio_assets").select("storage_path").eq("id", id).eq("photographer_id", user.id).maybeSingle();
  if (!data) return Response.json({ error: "Foto não encontrada." }, { status: 404 });
  const { error } = await supabaseAdmin.from("photographer_portfolio_assets").delete().eq("id", id).eq("photographer_id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.storage.from(BUCKET).remove([data.storage_path]);
  return Response.json({ ok: true });
}
