import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";



export async function GET(
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



  const { data:event, error } =
    await supabaseAdmin
      .from("events")
      .select("*")
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



  return NextResponse.json({

    event

  });



}






export async function PUT(
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


  const body =
    await request.json();



  const {
    name,
    city,
    event_date,
    slug,
    cover_image,
    published,
    share_message

  } = body;





  const { data:event, error } =
    await supabaseAdmin
      .from("events")
      .update({

        name,
        city,
        event_date,
        slug,
        cover_image,
        published,
        share_message: String(share_message || "").trim().slice(0, 1200) || null

      })
      .eq(
        "id",
        id
      )
      .select()
      .single();





  if(error){

    console.error(error);


    return NextResponse.json(
      {
        error:"Erro ao atualizar evento"
      },
      {
        status:500
      }
    );

  }





  return NextResponse.json({

    success:true,
    event

  });



}
