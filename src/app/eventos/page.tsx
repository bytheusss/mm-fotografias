import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const { data: events } = await supabaseAdmin.from("events").select("id,slug,name,city,event_date,total_photos,cover_image").eq("published", true).eq("archived", false).order("event_date", { ascending: false });
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl"><h1 className="text-4xl font-bold">Eventos</h1><p className="mb-10 mt-3 text-neutral-400">Escolha um evento para encontrar suas fotos.</p>{!events?.length ? <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8">Nenhum evento publicado no momento.</div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{events.map(event => <Link href={`/eventos/${event.slug}`} key={event.id} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 hover:border-red-600"><div className="relative aspect-[16/10] bg-neutral-800">{event.cover_image ? <Image src={event.cover_image} alt={event.name} fill className="object-cover transition group-hover:scale-105" /> : <div className="grid h-full place-items-center text-neutral-500">Sem capa</div>}</div><div className="p-5"><h2 className="text-xl font-bold">{event.name}</h2><p className="mt-2 text-neutral-400">{event.city} · {new Date(event.event_date).toLocaleDateString("pt-BR")}</p><p className="mt-2 text-sm text-red-400">{event.total_photos || 0} fotos</p></div></Link>)}</div>}</div></main>;
}
