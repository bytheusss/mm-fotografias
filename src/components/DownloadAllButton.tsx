import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import JSZip from "jszip";


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



  if(error || !order){

    return NextResponse.json(
      {
        error:"Pedido não encontrado"
      },
      {
        status:404
      }
    );

  }



  if(order.status !== "paid"){

    return NextResponse.json(
      {
        error:"Pagamento pendente"
      },
      {
        status:403
      }
    );

  }



  const photos =
    typeof order.photos === "string"
      ? JSON.parse(order.photos)
      : order.photos;



  const zip = new JSZip();



  for(const photo of photos){


    const filePath =
      photo.imagem
        .split("/thumbnails/")
        .pop();



    const { data } =
      await supabaseAdmin
        .storage
        .from("originals")
        .createSignedUrl(
          filePath,
          60
        );



    if(!data?.signedUrl){
      continue;
    }



    const response =
      await fetch(
        data.signedUrl
      );


    const arrayBuffer =
      await response.arrayBuffer();



    zip.file(
      `${photo.numero}.jpg`,
      arrayBuffer
    );


  }



  const zipBuffer =
    await zip.generateAsync({
      type:"arraybuffer"
    });



  return new NextResponse(
    zipBuffer,
    {
      headers:{
        "Content-Type":
          "application/zip",

        "Content-Disposition":
          `attachment; filename="fotos-${token}.zip"`
      }
    }
  );

}