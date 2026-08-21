import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("events").select("id,name,slug,event_date,archived").order("event_date", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ events: data });
}

export async function POST(request: Request) {
  const body = await request.json(); const name = String(body.name || "").trim(); const city = String(body.city || "").trim(); const eventDate = String(body.event_date || ""); const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!name || !city || !eventDate || !slug) return NextResponse.json({ error: "Preencha nome, cidade, data e slug" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("events").insert({ name, city, event_date: eventDate, slug, folder: slug, cover_image: body.cover_image || null, published: Boolean(body.published), total_photos: 0 }).select("id,slug").single();
  return error ? NextResponse.json({ error: error.code === "23505" ? "Esse slug já está em uso" : error.message }, { status: 400 }) : NextResponse.json({ success: true, event: data });
}
