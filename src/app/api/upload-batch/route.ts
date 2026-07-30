import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import sharp from "sharp";


export async function POST(request: Request) {

  try {

    const formData = await request.formData();


    const files =
      formData.getAll("files") as File[];


    const eventId =
      formData.get("event_id") as string;


    const slug =
      formData.get("slug") as string;



    if (!files.length || !eventId || !slug) {

      return NextResponse.json(
        {
          error: "Arquivos, evento ou slug ausentes"
        },
        {
          status:400
        }
      );

    }



    const uploaded = [];



    for (let i = 0; i < files.length; i++) {


      const file = files[i];


      const number = i + 1;


      const filename =
        String(number).padStart(4,"0") + ".jpg";



      const originalPath =
        `${slug}/${filename}`;


      const buffer =
        Buffer.from(
          await file.arrayBuffer()
        );



      /*
        ORIGINAL
      */

      await supabaseAdmin
        .storage
        .from("originals")
        .upload(
          originalPath,
          buffer,
          {
            contentType:"image/jpeg",
            upsert:true
          }
        );




      /*
        PREVIEW
      */


      const preview =
        await sharp(buffer)
          .resize(
            1600,
            2400,
            {
              fit:"inside"
            }
          )
          .jpeg({
            quality:85
          })
          .toBuffer();



      await supabaseAdmin
        .storage
        .from("previews")
        .upload(
          originalPath,
          preview,
          {
            contentType:"image/jpeg",
            upsert:true
          }
        );




      /*
        THUMBNAIL
      */


      const thumbnail =
        await sharp(buffer)
          .resize(
            800,
            1200,
            {
              fit:"inside"
            }
          )
          .jpeg({
            quality:75
          })
          .toBuffer();



      await supabaseAdmin
        .storage
        .from("thumbnails")
        .upload(
          originalPath,
          thumbnail,
          {
            contentType:"image/jpeg",
            upsert:true
          }
        );




      /*
        BANCO PHOTOS
      */


      const { error } =
        await supabaseAdmin
          .from("photos")
          .insert({

            event_id:eventId,

            number:number,

            title:
              `Foto ${filename.replace(".jpg","")}`,

            slug:
              `${slug}-${filename.replace(".jpg","")}`,

            original_path:
              `originals/${originalPath}`,

            preview_path:
              `previews/${originalPath}`,

            thumbnail_path:
              `thumbnails/${originalPath}`,

            price:15.00,

            status:"available",

            featured:false

          });



      if(error){

        console.error(error);

      }



      uploaded.push({

        number,

        filename

      });


    }



    return NextResponse.json({

      success:true,

      total:uploaded.length,

      photos:uploaded

    });



  } catch(error:any){


    console.error(error);


    return NextResponse.json(

      {
        error:error.message
      },

      {
        status:500
      }

    );

  }

}