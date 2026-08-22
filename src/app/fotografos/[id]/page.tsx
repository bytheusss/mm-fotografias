import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { publicRoleLabels } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function PhotographerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: profile }, { data: assignments }, { count }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id,full_name,bio,instagram_handle,avatar_url,role,roles,public_title,public_whatsapp,availability_text,featured_photo_ids").eq("id", id).contains("roles", ["photographer"]).eq("public_profile", true).maybeSingle(),
    supabaseAdmin.from("event_photographers").select("events(id,name,slug,city,event_date,cover_image,archived,access_mode)").eq("photographer_id", id).order("display_order"),
    supabaseAdmin.from("photos").select("id", { count: "exact", head: true }).eq("photographer_id", id).is("deleted_at", null),
  ]);
  if (!profile) notFound();
  const { data: featured } = profile.featured_photo_ids?.length ? await supabaseAdmin.from("photos").select("id,number,thumbnail_path,events(slug)").in("id", profile.featured_photo_ids).is("deleted_at", null) : { data: [] };
  const events = (assignments || []).map(row => row.events).flat().filter(event => event && !event.archived && event.access_mode === "public");
  return <main className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:px-6"><div className="mx-auto max-w-6xl">
    <section className="flex flex-col gap-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:flex-row sm:items-center">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-neutral-800">{profile.avatar_url ? <Image src={profile.avatar_url} alt={profile.full_name || "Fotógrafo"} fill className="object-cover" sizes="112px" /> : <span className="grid h-full place-items-center text-4xl">📷</span>}</div>
      <div><div className="mb-2 flex flex-wrap gap-2">{publicRoleLabels(profile).map(label=><span key={label} className="rounded-full border border-red-800 bg-red-950/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-300">{label}</span>)}</div><h1 className="text-4xl font-black">{profile.full_name || "Fotógrafo"}</h1>{profile.bio && <p className="mt-3 max-w-2xl text-neutral-300">{profile.bio}</p>}<div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-black px-4 py-2">{count || 0} fotos publicadas</span>{profile.instagram_handle && <a className="rounded-full bg-red-600 px-4 py-2 font-bold" href={`https://instagram.com/${profile.instagram_handle}`} target="_blank" rel="noreferrer">@{profile.instagram_handle}</a>}</div></div>
    </section>
    {(profile.public_title||profile.availability_text||profile.public_whatsapp)&&<section className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5">{profile.public_title&&<strong className="text-red-400">{profile.public_title}</strong>}{profile.availability_text&&<span className="text-neutral-300">{profile.availability_text}</span>}{profile.public_whatsapp&&<a href={`https://wa.me/55${profile.public_whatsapp}`} target="_blank" rel="noreferrer" className="ml-auto rounded-lg bg-green-700 px-4 py-2 font-bold">Falar no WhatsApp</a>}</section>}
    {!!featured?.length&&<><h2 className="mb-5 mt-10 text-2xl font-black">Portfólio em destaque</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{featured.map(photo=>{const path=String(photo.thumbnail_path||"").replace(/^thumbnails\//,"");const event=Array.isArray(photo.events)?photo.events[0]:photo.events;return <Link key={photo.id} href={`/eventos/${event?.slug||""}/${String(photo.number).padStart(4,"0")}`} className="relative aspect-square overflow-hidden rounded-lg"><Image src={supabaseAdmin.storage.from("thumbnails").getPublicUrl(path).data.publicUrl} alt={`Foto ${photo.number}`} fill className="object-cover transition hover:scale-105"/></Link>})}</div></>}
    <h2 className="mb-5 mt-10 text-2xl font-black">Eventos fotografados</h2>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.map(event => <Link key={event.id} href={`/eventos/${event.slug}`} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"><div className="relative aspect-[16/9] bg-neutral-800">{event.cover_image && <Image src={event.cover_image} alt="" fill className="object-cover transition group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />}</div><div className="p-5"><h3 className="text-xl font-bold">{event.name}</h3><p className="mt-1 text-neutral-400">{event.city}</p></div></Link>)}</div>
    {!events.length && <p className="rounded-xl border border-neutral-800 p-6 text-neutral-400">Os próximos eventos públicos aparecerão aqui.</p>}
  </div></main>;
}
