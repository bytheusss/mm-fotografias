import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashEventPassword } from "@/lib/event-access";



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
    share_message, base_price, access_mode, access_password

  } = body;





  const price = Number(base_price);
  if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Informe um preço válido." }, { status: 400 });
  if (!["public", "unlisted", "password"].includes(access_mode)) return NextResponse.json({ error: "Visibilidade inválida." }, { status: 400 });
  const update: Record<string, unknown> = { name, city, event_date, slug, cover_image, published, share_message: String(share_message || "").trim().slice(0, 1200) || null, base_price: price, access_mode };
  if (access_mode === "password" && String(access_password || "").trim()) update.access_password_hash = hashEventPassword(id, String(access_password));
  if (access_mode !== "password") update.access_password_hash = null;
  if (access_mode === "password" && !update.access_password_hash) { const { data: current } = await supabaseAdmin.from("events").select("access_password_hash").eq("id", id).maybeSingle(); if (!current?.access_password_hash) return NextResponse.json({ error: "Defina uma senha para proteger o álbum." }, { status: 400 }); }

  const { data:event, error } =
    await supabaseAdmin
      .from("events")
      .update(update)
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
