import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id:string;
      photoId:string;
    }>;
  }
) {


  const {
    photoId
  } = await params;



  const { data:photo } =
    await supabaseAdmin
      .from("photos")
      .select("*")
      .eq(
        "id",
        photoId
      )
      .single();



  if(!photo){

    return NextResponse.json(
      {
        success:false,
        error:"Foto não encontrada"
      },
      {
        status:404
      }
    );

  }





  // remove arquivos do storage

  await supabaseAdmin
    .storage
    .from("photos")
    .remove([
      photo.original_path,
      photo.preview_path,
      photo.thumbnail_path
    ]);






  const { error } =
    await supabaseAdmin
      .from("photos")
      .delete()
      .eq(
        "id",
        photoId
      );



  if(error){

    return NextResponse.json(
      {
        success:false,
        error:error.message
      },
      {
        status:500
      }
    );

  }





  return NextResponse.json({

    success:true

  });


}