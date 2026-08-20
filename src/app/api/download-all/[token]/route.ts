import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      token: string;
    }>;
  }
) {

  const { token } = await params;


  const { data: order, error } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .eq(
        "download_token",
        token
      )
      .single();



  if (
    error ||
    !order
  ) {

    return NextResponse.json(
      {
        error: "Pedido não encontrado"
      },
      {
        status: 404
      }
    );

  }



  if (
    order.status !== "paid"
  ) {

    return NextResponse.json(
      {
        error: "Pagamento pendente"
      },
      {
        status: 403
      }
    );

  }



  let photos: Array<{ numero?: string | number; imagem?: string }> = [];
  try { photos = typeof order.photos === "string" ? JSON.parse(order.photos) : order.photos; } catch { photos = []; }



  const downloads = [];



  for (const photo of photos) {


    const filePath =
      photo.imagem
        ?.split("?")[0]
        .split("/thumbnails/")
        .pop();



    if (!filePath) {
      continue;
    }



    const { data, error } =
      await supabaseAdmin
        .storage
        .from("originals")
        .createSignedUrl(
          filePath,
          60
        );



    if (
      error ||
      !data?.signedUrl
    ) {

      console.error(
        "ERRO FOTO:",
        photo.numero,
        error
      );

      continue;

    }



    downloads.push({

      numero:
        photo.numero,

      url:
        data.signedUrl

    });


  }



  return NextResponse.json({ downloads }, { headers: { "Cache-Control": "private, no-store" } });


}
