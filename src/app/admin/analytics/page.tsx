import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export default async function AnalyticsPage() {
  const [{ data: interactions }, { data: events }] = await Promise.all([
    supabaseAdmin.from("photo_interactions").select("event_id,photo_id,kind,created_at").order("created_at", { ascending: false }).limit(10000),
    supabaseAdmin.from("events").select("id,name,view_count").order("event_date", { ascending: false }),
  ]);
  const rows = (events || []).map(event => { const own = (interactions || []).filter(item => item.event_id === event.id); return { ...event, photoViews: own.filter(item => item.kind === "view").length, favorites: own.filter(item => item.kind === "favorite").length, carts: own.filter(item => item.kind === "cart").length }; });
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl"><h1 className="mb-2 text-4xl font-black">Métricas</h1><p className="mb-8 text-neutral-400">Interesse real por evento e pelas fotos abertas.</p><div className="overflow-x-auto rounded-xl border border-neutral-800"><table className="w-full text-left"><thead className="bg-neutral-900 text-neutral-400"><tr><th className="p-4">Evento</th><th className="p-4">Página</th><th className="p-4">Fotos abertas</th><th className="p-4">Favoritos</th><th className="p-4">Carrinho</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-neutral-800"><td className="p-4 font-bold">{row.name}</td><td className="p-4">{row.view_count || 0}</td><td className="p-4">{row.photoViews}</td><td className="p-4">{row.favorites}</td><td className="p-4">{row.carts}</td></tr>)}</tbody></table></div></div></main>;
}
