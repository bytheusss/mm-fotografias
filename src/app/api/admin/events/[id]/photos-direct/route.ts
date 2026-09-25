import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateImageVersions } from "@/lib/supabase/upload/image-processing";
import { canUploadEvent, getStaffUser } from "@/lib/photographer-auth";
import { createOriginalUploadTarget, deleteOriginal, ensureOriginalUploadCors, readOriginal, writeOriginal } from "@/lib/original-storage";

export const maxDuration = 60;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json(); const size = Number(body.size); const type = String(body.type || ""); const checksum = String(body.checksum || "");
  if (!(await canUploadEvent(id))) return NextResponse.json({ error: "Sem permissão para enviar neste evento." }, { status: 403 });
  if (!type.startsWith("image/") || !Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) return NextResponse.json({ error: "Use imagens de até 50 MB." }, { status: 400 });
  const { data: event } = await supabaseAdmin.from("events").select("slug,base_price").eq("id", id).maybeSingle();
  if (!event) return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  if (checksum) { const { data: duplicate } = await supabaseAdmin.from("photos").select("number").eq("event_id", id).eq("checksum", checksum).maybeSingle(); if (duplicate) return NextResponse.json({ error: `Foto duplicada da #${String(duplicate.number).padStart(4, "0")}.` }, { status: 409 }); }
  const path = `${event.slug}/temp/${crypto.randomUUID()}`;
  try { await ensureOriginalUploadCors(request.headers.get("origin")); return NextResponse.json(await createOriginalUploadTarget(path, type)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível preparar o envio." }, { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { path, checksum, photographerId, category } = await request.json();
  if (!(await canUploadEvent(id))) return NextResponse.json({ error: "Sem permissão para enviar neste evento." }, { status: 403 });
  const { data: event } = await supabaseAdmin.from("events").select("slug,base_price").eq("id", id).maybeSingle();
  const staff = await getStaffUser(); let authorId: string | null = staff?.roles.includes("photographer") ? staff.user.id : null;
  if (staff && ["owner", "admin"].includes(staff.role) && photographerId) { const { data: assignment } = await supabaseAdmin.from("event_photographers").select("photographer_id").eq("event_id", id).eq("photographer_id", photographerId).maybeSingle(); if (!assignment) return NextResponse.json({ error: "Fotógrafo não vinculado a este evento." }, { status: 400 }); authorId = assignment.photographer_id; }
  if (!event || typeof path !== "string" || !path.replace(/^b2\//, "").startsWith(`${event.slug}/temp/`)) return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  try {
    const raw = await readOriginal(path);
    const { data: lastPhoto } = await supabaseAdmin.from("photos").select("number").eq("event_id", id).order("number", { ascending: false }).limit(1).maybeSingle();
    const number = Number(lastPhoto?.number || 0) + 1; const padded = String(number).padStart(4, "0"); const filename = `${padded}.jpg`; const finalPath = `${event.slug}/${filename}`;
    const versions = await generateImageVersions(raw, `#${padded}`);
    const [originalReference, ...uploads] = await Promise.all([
      writeOriginal(finalPath, versions.original),
      supabaseAdmin.storage.from("previews").upload(finalPath, versions.preview, { contentType: "image/jpeg", upsert: false }),
      supabaseAdmin.storage.from("thumbnails").upload(finalPath, versions.thumbnail, { contentType: "image/jpeg", upsert: false }),
    ]);
    const storageError = uploads.find(result => result.error)?.error; if (storageError) throw storageError;
    const { error: insertError } = await supabaseAdmin.from("photos").insert({ event_id: id, number, title: `Foto ${padded}`, slug: `${event.slug}-${padded}`, original_path: originalReference, preview_path: `previews/${finalPath}`, thumbnail_path: `thumbnails/${finalPath}`, price: Number(event.base_price || 15), status: "available", featured: false, checksum: String(checksum || "") || null, photographer_id: authorId, category: String(category || "Geral").trim().slice(0, 60) || "Geral" });
    if (insertError) { await Promise.all([deleteOriginal(originalReference), ...["previews", "thumbnails"].map(name => supabaseAdmin.storage.from(name).remove([finalPath]))]); throw insertError; }
    await supabaseAdmin.from("events").update({ total_photos: number }).eq("id", id);
    return NextResponse.json({ success: true, number, filename });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao processar foto." }, { status: 500 }); }
  finally { await deleteOriginal(path).catch(() => undefined); }
}
