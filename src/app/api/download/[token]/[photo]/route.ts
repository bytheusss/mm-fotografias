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

  const photos =
    typeof order.photos === "string"
      ? JSON.parse(order.photos)
      : order.photos;

  const selectedPhoto =
    photos.find(
      (p: any) => p.numero === photo
    );

  if (!selectedPhoto) {
    return NextResponse.json(
      { error: "Foto não encontrada" },
      { status: 404 }
    );
  }

  const filePath =
    selectedPhoto.imagem
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

  return new NextResponse(blob, {
    headers: {
      "Content-Type": imageResponse.headers.get("Content-Type") ?? "image/jpeg",
      "Content-Disposition": `attachment; filename="${selectedPhoto.numero}.jpg"`,
    },
  });
}