import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export async function POST(
  req: Request
){

  try{


    const formData =
      await req.formData();



    const file =
      formData.get("file") as File;



    const eventId =
      formData.get("event_id") as string;



    if(!file || !eventId){

      return NextResponse.json(
        {
          success:false,
          error:"Arquivo ou evento não informado"
        },
        {
          status:400
        }
      );

    }




    const { data:event, error:eventError } =
      await supabaseAdmin
        .from("events")
        .select("folder")
        .eq(
          "id",
          eventId
        )
        .single();




    if(eventError || !event){

      return NextResponse.json(
        {
          success:false,
          error:"Evento não encontrado"
        },
        {
          status:404
        }
      );

    }





    const bytes =
      await file.arrayBuffer();



    const buffer =
      Buffer.from(bytes);





    const ext =
      file.name
      .split(".")
      .pop();





    const fileName =
      `${event.folder}/capa-${Date.now()}.${ext}`;






    const { error:uploadError } =
      await supabaseAdmin
        .storage
        .from("thumbnails")
        .upload(
          fileName,
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
          success:false,
          error:uploadError.message
        },
        {
          status:500
        }
      );

    }







    const { data:urlData } =
      supabaseAdmin
        .storage
        .from("thumbnails")
        .getPublicUrl(
          fileName
        );





    const url =
      urlData.publicUrl;







    const { error:updateError } =
      await supabaseAdmin
        .from("events")
        .update({

          cover_image:url

        })
        .eq(
          "id",
          eventId
        );






    if(updateError){


      return NextResponse.json(
        {
          success:false,
          error:updateError.message
        },
        {
          status:500
        }
      );


    }







    return NextResponse.json({

      success:true,
      url

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