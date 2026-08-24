import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ numero?: string; placa?: string }> }) {
  const params = await searchParams;
  const raw = params.numero?.replace(/\D/g, "");
  const plate = params.placa?.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (!raw && !plate) notFound();
  const number = raw?.padStart(4, "0");
  let query = supabaseAdmin
    .from("photos")
    .select("id,number,thumbnail_path,event_id,status,plate_text,events!inner(slug,name,published,access_mode)")
    .eq("events.published", true)
    .eq("events.access_mode", "public");
  query = number ? query.eq("number", Number(number)) : query.ilike("plate_text", `%${plate}%`);
  const { data: photos } = await query;

  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-5xl">
    <h1 className="text-4xl font-bold">{number ? `Resultados para a foto #${number}` : `Resultados para a placa ${plate}`}</h1>
    {!photos?.length ? <div className="mt-8 rounded-xl border border-neutral-800 p-8"><p className="text-neutral-400">Nenhuma foto com esse número foi encontrada nos eventos publicados.</p><Link href="/#busca" className="mt-5 inline-block text-red-400">Tentar outro número</Link></div> :
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo: any) => {
        const event = Array.isArray(photo.events) ? photo.events[0] : photo.events;
        const photoNumber = String(photo.number).padStart(4, "0");
        const image = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.thumbnail_path}`;
        return <Link key={photo.id} href={`/eventos/${event.slug}/${photoNumber}`} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition hover:border-red-600">
          <img src={image} alt={`Foto ${photoNumber} — ${event.name}`} className="aspect-square w-full object-cover" />
          <div className="p-5"><h2 className="font-bold">{event.name}</h2><p className="mt-1 text-neutral-400">Foto #{photoNumber}{photo.plate_text ? ` · ${photo.plate_text}` : ""}</p></div>
        </Link>;
      })}</div>}
  </div></main>;
}
