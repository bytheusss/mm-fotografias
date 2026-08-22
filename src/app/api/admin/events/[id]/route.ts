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



  const { data: assignments } = await supabaseAdmin.from("event_photographers").select("photographer_id,is_default").eq("event_id", id).order("is_default", { ascending: false });
  return NextResponse.json({ event: { ...event, photographer_ids: (assignments || []).map(row => row.photographer_id), default_photographer_id: assignments?.find(row => row.is_default)?.photographer_id || "" } });



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
    share_message, base_price, access_mode, access_password, sales_paused, publish_at, unpublish_at, access_expires_at

  } = body;





  const price = Number(base_price);
  if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Informe um preço válido." }, { status: 400 });
  if (!["public", "unlisted", "password"].includes(access_mode)) return NextResponse.json({ error: "Visibilidade inválida." }, { status: 400 });
  const update: Record<string, unknown> = { name, city, event_date, slug, cover_image, published, share_message: String(share_message || "").trim().slice(0, 1200) || null, base_price: price, access_mode, sales_paused: Boolean(sales_paused), publish_at: publish_at ? new Date(publish_at).toISOString() : null, unpublish_at: unpublish_at ? new Date(unpublish_at).toISOString() : null, access_expires_at: access_expires_at ? new Date(access_expires_at).toISOString() : null };
  if (access_mode === "password" && String(access_password || "").trim()) { update.access_password_hash = hashEventPassword(id, String(access_password)); const { data: currentVersion } = await supabaseAdmin.from("events").select("password_version").eq("id", id).maybeSingle(); update.password_version = Number(currentVersion?.password_version || 1) + 1; }
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

  if (Array.isArray(body.photographer_ids)) {
    const photographerIds = [...new Set(body.photographer_ids.map(String))].slice(0, 30);
    const { data: valid } = photographerIds.length ? await supabaseAdmin.from("profiles").select("id").contains("roles", ["photographer"]).in("id", photographerIds) : { data: [] };
    await supabaseAdmin.from("event_photographers").delete().eq("event_id", id);
    if (valid?.length) await supabaseAdmin.from("event_photographers").insert(valid.map(person => ({ event_id: id, photographer_id: person.id, can_upload: true, can_manage_photos: false, is_default: person.id === body.default_photographer_id || (!body.default_photographer_id && person.id === valid[0].id) })));
  }





  return NextResponse.json({

    success:true,
    event

  });



}
