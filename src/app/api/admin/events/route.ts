import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auditAdmin } from "@/lib/audit";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("events").select("id,name,slug,event_date,archived").order("event_date", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ events: data });
}

export async function POST(request: Request) {
  const body = await request.json(); const name = String(body.name || "").trim(); const city = String(body.city || "").trim(); const eventDate = String(body.event_date || "");
  if (!name || !city || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NextResponse.json({ error: "Preencha nome, cidade e data" }, { status: 400 });
  const baseSlug = `${name}-${eventDate}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); let slug = baseSlug; let suffix = 2;
  while ((await supabaseAdmin.from("events").select("id").eq("slug", slug).maybeSingle()).data) slug = `${baseSlug}-${suffix++}`;
  const { data, error } = await supabaseAdmin.from("events").insert({ name, city, event_date: eventDate, slug, folder: slug, cover_image: body.cover_image || null, published: Boolean(body.published), total_photos: 0 }).select("id,slug").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Esse slug já está em uso" : error.message }, { status: 400 });
  const photographerIds = Array.isArray(body.photographerIds) ? [...new Set(body.photographerIds.map(String))].slice(0, 30) : [];
  if (photographerIds.length) {
    const { data: valid } = await supabaseAdmin.from("profiles").select("id").contains("roles", ["photographer"]).in("id", photographerIds);
    if (valid?.length) await supabaseAdmin.from("event_photographers").upsert(valid.map((person, index) => ({ event_id: data.id, photographer_id: person.id, can_upload: true, can_manage_photos: false, is_default: index === 0 })));
  }
  await auditAdmin("create", "event", String(data.id), { name, slug, published: Boolean(body.published) });
  return NextResponse.json({ success: true, event: data });
}
