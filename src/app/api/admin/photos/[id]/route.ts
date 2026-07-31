import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id:string;
    }>;
  }
){

  try{


    const { id } = await params;



    const { data:photo, error:findError } =
      await supabaseAdmin
        .from("photos")
        .select("*")
        .eq(
          "id",
          id
        )
        .single();



    if(findError || !photo){

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





    // remove original

    if(photo.original_path){

      await supabaseAdmin
        .storage
        .from("originals")
        .remove([
          photo.original_path
        ]);

    }




    // remove preview

    if(photo.preview_path){

      await supabaseAdmin
        .storage
        .from("previews")
        .remove([
          photo.preview_path
        ]);

    }




    // remove thumbnail

    if(photo.thumbnail_path){

      await supabaseAdmin
        .storage
        .from("thumbnails")
        .remove([
          photo.thumbnail_path
        ]);

    }






    const { error:deleteError } =
      await supabaseAdmin
        .from("photos")
        .delete()
        .eq(
          "id",
          id
        );




    if(deleteError){

      return NextResponse.json(
        {
          success:false,
          error:deleteError.message
        },
        {
          status:500
        }
      );

    }




    return NextResponse.json({

      success:true

    });





  }catch(error:any){


    console.error(error);


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

}