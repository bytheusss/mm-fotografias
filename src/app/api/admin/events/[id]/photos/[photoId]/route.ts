import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateImageVersions } from "@/lib/supabase/upload/image-processing";

export const maxDuration = 60;

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { id, photoId } = await params;
  const { data: photo } = await supabaseAdmin.from("photos").select("id,event_id,number,original_path,preview_path,thumbnail_path").eq("id", photoId).eq("event_id", id).maybeSingle();
  if (!photo) return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  const originalPath = String(photo.original_path).replace(/^originals\//, "");
  const { data: original, error: downloadError } = await supabaseAdmin.storage.from("originals").download(originalPath);
  if (downloadError || !original) return NextResponse.json({ error: "Original não encontrado." }, { status: 404 });
  try {
    const padded = String(photo.number).padStart(4, "0");
    const versions = await generateImageVersions(Buffer.from(await original.arrayBuffer()), `#${padded}`);
    const previewPath = String(photo.preview_path).replace(/^previews\//, "");
    const thumbnailPath = String(photo.thumbnail_path).replace(/^thumbnails\//, "");
    const [preview, thumbnail] = await Promise.all([
      supabaseAdmin.storage.from("previews").upload(previewPath, versions.preview, { contentType: "image/jpeg", upsert: true }),
      supabaseAdmin.storage.from("thumbnails").upload(thumbnailPath, versions.thumbnail, { contentType: "image/jpeg", upsert: true }),
    ]);
    const error = preview.error || thumbnail.error;
    return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha no processamento." }, { status: 500 }); }
}


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
