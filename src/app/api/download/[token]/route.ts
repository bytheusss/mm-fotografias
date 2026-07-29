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


  console.log(
    "DOWNLOAD TOKEN:",
    token
  );



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



  const photo =
    photos[0];



  if(!photo){

    return NextResponse.json(
      {
        error:"Nenhuma foto encontrada"
      },
      {
        status:404
      }
    );

  }





  /*
    Aqui pegamos o caminho do arquivo original

    Exemplo:
    originals/aacrc-05072026/0002.jpg

  */


  const filePath =
    photo.imagem
      .split("/thumbnails/")
      .pop();



  if(!filePath){

    return NextResponse.json(
      {
        error:"Caminho inválido"
      },
      {
        status:400
      }
    );

  }




  const { data: signedUrl, error: urlError } =
    await supabaseAdmin
      .storage
      .from("originals")
      .createSignedUrl(
        filePath,
        60
      );




  if(
    urlError ||
    !signedUrl?.signedUrl
  ){

    console.error(
      "SIGNED URL ERROR:",
      urlError
    );


    return NextResponse.json(
      {
        error:"Arquivo original não encontrado"
      },
      {
        status:404
      }
    );

  }




  return NextResponse.redirect(
    signedUrl.signedUrl
  );


}