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

  console.log("DOWNLOAD TOKEN:", token);


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



  const photos =
    typeof order.photos === "string"
      ? JSON.parse(order.photos)
      : order.photos;



  const { searchParams } = new URL(request.url);

  const numeroFoto =
    searchParams.get("photo");



  if (!numeroFoto) {

    return NextResponse.json(
      {
        error: "Número da foto não informado"
      },
      {
        status: 400
      }
    );

  }



  const photo =
    photos.find(
      (p: any) =>
        String(p.numero) === String(numeroFoto)
    );



  if (!photo) {

    return NextResponse.json(
      {
        error: "Foto não encontrada"
      },
      {
        status: 404
      }
    );

  }



  /*
    Caminho esperado:

    originals/aacrc-05072026/0002.jpg

  */


  const filePath =
    `aacrc-05072026/${photo.numero}.jpg`;



  console.log(
    "BUSCANDO ORIGINAL:",
    filePath
  );



  const {
    data: signedUrl,
    error: urlError
  } =
    await supabaseAdmin
      .storage
      .from("originals")
      .createSignedUrl(
        filePath,
        60
      );



  if (
    urlError ||
    !signedUrl?.signedUrl
  ) {

    console.error(
      "SIGNED URL ERROR:",
      urlError
    );


    return NextResponse.json(
      {
        error: "Arquivo original não encontrado",
        path: filePath
      },
      {
        status: 404
      }
    );

  }



  return NextResponse.redirect(
    signedUrl.signedUrl
  );

}