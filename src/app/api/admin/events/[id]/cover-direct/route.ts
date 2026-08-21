import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const maxDuration = 60;
const bucket = "thumbnails";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json(); const size = Number(body.size); const type = String(body.type || "");
  if (!type.startsWith("image/") || !Number.isFinite(size) || size <= 0 || size > 10 * 1024 * 1024) return NextResponse.json({ error: "Use uma imagem JPG, PNG ou WebP de até 10 MB." }, { status: 400 });
  const { data: event } = await supabaseAdmin.from("events").select("folder").eq("id", id).maybeSingle();
  if (!event) return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  const path = `${event.folder}/temp-cover-${crypto.randomUUID()}`;
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ path, token: data.token });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { path } = await request.json();
  if (typeof path !== "string" || !path.includes("/temp-cover-")) return NextResponse.json({ error: "Capa inválida." }, { status: 400 });
  const { data: event } = await supabaseAdmin.from("events").select("folder").eq("id", id).maybeSingle();
  if (!event || !path.startsWith(`${event.folder}/`)) return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  const { data: raw, error: downloadError } = await supabaseAdmin.storage.from(bucket).download(path);
  if (downloadError || !raw) return NextResponse.json({ error: "Não foi possível ler a capa enviada." }, { status: 500 });
  try {
    const output = await sharp(Buffer.from(await raw.arrayBuffer())).rotate().resize({ width: 1800, height: 1200, fit: "cover", position: "centre", withoutEnlargement: true }).jpeg({ quality: 86 }).toBuffer();
    const finalPath = `${event.folder}/capa-${Date.now()}.jpg`;
    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(finalPath, output, { contentType: "image/jpeg", upsert: true });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(finalPath);
    const { error: updateError } = await supabaseAdmin.from("events").update({ cover_image: urlData.publicUrl }).eq("id", id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Imagem inválida." }, { status: 400 }); }
  finally { await supabaseAdmin.storage.from(bucket).remove([path]); }
}
