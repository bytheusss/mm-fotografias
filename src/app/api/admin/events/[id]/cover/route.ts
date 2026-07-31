import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";



export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id:string;
    }>;
  }
){


  const { id } = await params;



  const formData =
    await request.formData();



  const file =
    formData.get("file") as File;



  if(!file){

    return NextResponse.json(
      {
        error:"Nenhuma imagem enviada"
      },
      {
        status:400
      }
    );

  }




  const { data:event,error } =
    await supabaseAdmin
      .from("events")
      .select("slug")
      .eq(
        "id",
        id
      )
      .single();



  if(error || !event){

    return NextResponse.json(
      {
        error:"Evento não encontrado"
      },
      {
        status:404
      }
    );

  }





  const extension =
    file.name
      .split(".")
      .pop();



  const path =
    `events/${event.slug}/cover.${extension}`;





  const buffer =
    Buffer.from(
      await file.arrayBuffer()
    );





  const { error:uploadError } =
    await supabaseAdmin
      .storage
      .from("previews")
      .upload(
        path,
        buffer,
        {
          contentType:file.type,
          upsert:true
        }
      );




  if(uploadError){

    console.error(uploadError);

    return NextResponse.json(
      {
        error:"Erro ao enviar capa"
      },
      {
        status:500
      }
    );

  }





  const {
    data:urlData
  } =
    supabaseAdmin
      .storage
      .from("previews")
      .getPublicUrl(
        path
      );





  await supabaseAdmin
    .from("events")
    .update({

      cover_image:
        urlData.publicUrl

    })
    .eq(
      "id",
      id
    );






  return NextResponse.json({

    success:true,

    url:
      urlData.publicUrl

  });


}