import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateImageVersions } from "@/lib/supabase/upload/image-processing";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter(value => value instanceof File) as File[];
    const eventId = String(formData.get("event_id") || "");
    if (!files.length || !eventId) return NextResponse.json({ error: "Arquivos ou evento ausentes" }, { status: 400 });
    if (files.length > 20) return NextResponse.json({ error: "Envie no máximo 20 arquivos por requisição" }, { status: 400 });
    const { data: event } = await supabaseAdmin.from("events").select("id,slug").eq("id", eventId).maybeSingle();
    if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    const { data: lastPhoto } = await supabaseAdmin.from("photos").select("number").eq("event_id", eventId).order("number", { ascending: false }).limit(1).maybeSingle();
    let nextNumber = Number(lastPhoto?.number || 0) + 1;
    const uploaded: Array<{ number: number; filename: string }> = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) throw new Error(`${file.name}: formato inválido ou arquivo maior que 25 MB`);
      const number = nextNumber++; const padded = String(number).padStart(4, "0"); const filename = `${padded}.jpg`; const storagePath = `${event.slug}/${filename}`;
      const versions = await generateImageVersions(Buffer.from(await file.arrayBuffer()));
      const uploads = await Promise.all([
        supabaseAdmin.storage.from("originals").upload(storagePath, versions.original, { contentType: "image/jpeg", upsert: false }),
        supabaseAdmin.storage.from("previews").upload(storagePath, versions.preview, { contentType: "image/jpeg", upsert: false }),
        supabaseAdmin.storage.from("thumbnails").upload(storagePath, versions.thumbnail, { contentType: "image/jpeg", upsert: false }),
      ]);
      const storageError = uploads.find(result => result.error)?.error; if (storageError) throw storageError;
      const { error } = await supabaseAdmin.from("photos").insert({ event_id: eventId, number, title: `Foto ${padded}`, slug: `${event.slug}-${padded}`, original_path: `originals/${storagePath}`, preview_path: `previews/${storagePath}`, thumbnail_path: `thumbnails/${storagePath}`, price: 15, status: "available", featured: false });
      if (error) { await Promise.all(["originals", "previews", "thumbnails"].map(bucket => supabaseAdmin.storage.from(bucket).remove([storagePath]))); throw error; }
      uploaded.push({ number, filename });
    }
    await supabaseAdmin.from("events").update({ total_photos: nextNumber - 1 }).eq("id", eventId);
    return NextResponse.json({ success: true, total: uploaded.length, photos: uploaded });
  } catch (error) {
    console.error("UPLOAD BATCH ERROR", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro no upload" }, { status: 500 });
  }
}
