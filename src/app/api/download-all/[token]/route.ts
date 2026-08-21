import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { orderPhotos, type OrderPhoto } from "@/lib/orders";
import JSZip from "jszip";

function originalPath(photo: OrderPhoto) {
  const explicit = String(photo.original_path || "").replace(/^originals\//, "");
  if (explicit) return explicit;
  const image = String(photo.imagem || photo.thumbnail_url || photo.thumbnail || "").split("?")[0];
  return image.includes("/thumbnails/") ? image.split("/thumbnails/").pop() || "" : "";
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data: order, error } = await supabaseAdmin.from("orders").select("id,status,photos,download_expires_at,download_count").eq("download_token", token).maybeSingle();
  if (error || !order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (order.status !== "paid") return NextResponse.json({ error: "Pagamento pendente" }, { status: 403 });
  if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) return NextResponse.json({ error: "Link expirado. Solicite um novo acesso." }, { status: 410 });
  const photos = orderPhotos(order.photos); const zip = new JSZip(); let included = 0;
  for (const [index, photo] of photos.entries()) {
    const path = originalPath(photo); if (!path) continue;
    const { data } = await supabaseAdmin.storage.from("originals").download(path); if (!data) continue;
    const number = String(photo.numero || index + 1).padStart(4, "0"); zip.file(`${number}.jpg`, await data.arrayBuffer()); included += 1;
  }
  if (!included) return NextResponse.json({ error: "Nenhum original disponível" }, { status: 404 });
  const content = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  await supabaseAdmin.from("orders").update({ download_count: Number(order.download_count || 0) + 1 }).eq("id", order.id);
  return new NextResponse(Buffer.from(content), { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="pedido-${String(order.id).slice(0, 8)}.zip"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
