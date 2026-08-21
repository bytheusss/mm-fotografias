import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      token: string;
      photo: string;
    }>;
  }
) {

  const { token, photo } = await params;

  const { data: order, error } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("download_token", token)
      .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "Pedido não encontrado" },
      { status: 404 }
    );
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Pagamento pendente" },
      { status: 403 }
    );
  }
  if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) return NextResponse.json({ error: "Link expirado. Solicite um novo acesso." }, { status: 410 });
  if (order.download_revoked_at) return NextResponse.json({ error: "Acesso aos downloads revogado." }, { status: 403 });

  let photos: Array<{ numero?: string | number; imagem?: string }> = [];
  try { photos = typeof order.photos === "string" ? JSON.parse(order.photos) : order.photos; } catch { photos = []; }

  const selectedPhoto =
    photos.find(
      (p) => String(p.numero) === photo
    );

  if (!selectedPhoto) {
    return NextResponse.json(
      { error: "Foto não encontrada" },
      { status: 404 }
    );
  }

  const filePath =
    selectedPhoto.imagem
      ?.split("?")[0]
      .split("/thumbnails/")
      .pop();

  if (!filePath) {
    return NextResponse.json(
      { error: "Caminho inválido" },
      { status: 400 }
    );
  }

  const { data, error: urlError } =
    await supabaseAdmin
      .storage
      .from("originals")
      .createSignedUrl(filePath, 60);

  if (urlError || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Arquivo original não encontrado" },
      { status: 404 }
    );
  }

  const imageResponse =
    await fetch(data.signedUrl);

  const blob =
    await imageResponse.blob();
  await supabaseAdmin.from("orders").update({ download_count: Number(order.download_count || 0) + 1 }).eq("id", order.id);
  await supabaseAdmin.from("download_access_logs").insert({ order_id: order.id, kind: "individual", photo_number: String(selectedPhoto.numero) });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": imageResponse.headers.get("Content-Type") ?? "image/jpeg",
      "Content-Disposition": `attachment; filename="${selectedPhoto.numero}.jpg"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
