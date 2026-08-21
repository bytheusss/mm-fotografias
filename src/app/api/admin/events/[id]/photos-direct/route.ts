import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateImageVersions } from "@/lib/supabase/upload/image-processing";

export const maxDuration = 60;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json(); const size = Number(body.size); const type = String(body.type || "");
  if (!type.startsWith("image/") || !Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) return NextResponse.json({ error: "Use imagens de até 25 MB." }, { status: 400 });
  const { data: event } = await supabaseAdmin.from("events").select("slug").eq("id", id).maybeSingle();
  if (!event) return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  const path = `${event.slug}/temp/${crypto.randomUUID()}`;
  const { data, error } = await supabaseAdmin.storage.from("originals").createSignedUploadUrl(path);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ path, token: data.token });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { path } = await request.json();
  const { data: event } = await supabaseAdmin.from("events").select("slug").eq("id", id).maybeSingle();
  if (!event || typeof path !== "string" || !path.startsWith(`${event.slug}/temp/`)) return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  const { data: raw, error: downloadError } = await supabaseAdmin.storage.from("originals").download(path);
  if (downloadError || !raw) return NextResponse.json({ error: "Não foi possível ler a foto enviada." }, { status: 500 });
  try {
    const versions = await generateImageVersions(Buffer.from(await raw.arrayBuffer()));
    const { data: lastPhoto } = await supabaseAdmin.from("photos").select("number").eq("event_id", id).order("number", { ascending: false }).limit(1).maybeSingle();
    const number = Number(lastPhoto?.number || 0) + 1; const padded = String(number).padStart(4, "0"); const filename = `${padded}.jpg`; const finalPath = `${event.slug}/${filename}`;
    const uploads = await Promise.all([
      supabaseAdmin.storage.from("originals").upload(finalPath, versions.original, { contentType: "image/jpeg", upsert: false }),
      supabaseAdmin.storage.from("previews").upload(finalPath, versions.preview, { contentType: "image/jpeg", upsert: false }),
      supabaseAdmin.storage.from("thumbnails").upload(finalPath, versions.thumbnail, { contentType: "image/jpeg", upsert: false }),
    ]);
    const storageError = uploads.find(result => result.error)?.error; if (storageError) throw storageError;
    const { error: insertError } = await supabaseAdmin.from("photos").insert({ event_id: id, number, title: `Foto ${padded}`, slug: `${event.slug}-${padded}`, original_path: `originals/${finalPath}`, preview_path: `previews/${finalPath}`, thumbnail_path: `thumbnails/${finalPath}`, price: 15, status: "available", featured: false });
    if (insertError) { await Promise.all(["originals", "previews", "thumbnails"].map(name => supabaseAdmin.storage.from(name).remove([finalPath]))); throw insertError; }
    await supabaseAdmin.from("events").update({ total_photos: number }).eq("id", id);
    return NextResponse.json({ success: true, number, filename });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar foto." }, { status: 500 }); }
  finally { await supabaseAdmin.storage.from("originals").remove([path]); }
}
