import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { publicRoleLabels } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function PhotographersPage() {
  const [{ data: people }, { data: portfolio }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id,full_name,bio,instagram_handle,avatar_url,role,roles").contains("roles", ["photographer"]).eq("public_profile", true).order("full_name"),
    supabaseAdmin.from("photographer_portfolio_assets").select("id,photographer_id,storage_path,title").eq("published", true).order("sort_order").order("created_at", { ascending: false }),
  ]);
  const previews = new Map<string, NonNullable<typeof portfolio>>();
  for (const photo of portfolio || []) {
    const current = previews.get(photo.photographer_id) || [];
    if (current.length < 3) previews.set(photo.photographer_id, [...current, photo]);
  }
  return <main className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:px-6"><div className="mx-auto max-w-7xl">
    <p className="text-sm font-bold uppercase tracking-widest text-red-500">Equipe e portfólios</p>
    <h1 className="text-4xl font-black sm:text-6xl">Quem faz a M&amp;M</h1>
    <p className="mb-10 mt-3 max-w-3xl text-neutral-400">Conheça cada profissional, seus cargos, sua história, avaliações e uma seleção individual dos trabalhos que representam o seu olhar.</p>
    <div className="grid gap-6 lg:grid-cols-2">{(people || []).map(person => {const photos=previews.get(person.id)||[];return <article key={person.id} className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:-translate-y-1 hover:border-red-800">
      <div className="grid h-48 grid-cols-3 gap-1 bg-neutral-950">{photos.length?photos.map((photo,index)=><div key={photo.id} className={`relative overflow-hidden ${photos.length===1?"col-span-3":photos.length===2&&index===0?"col-span-2":""}`}><Image src={supabaseAdmin.storage.from("portfolio-assets").getPublicUrl(photo.storage_path).data.publicUrl} alt={photo.title||`Trabalho de ${person.full_name}`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw"/></div>):<div className="col-span-3 grid place-items-center text-sm text-neutral-600">Portfólio em preparação</div>}</div>
      <div className="p-6"><div className="flex gap-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-neutral-800 bg-neutral-800">{person.avatar_url?<Image src={person.avatar_url} alt={person.full_name||"Profissional M&M"} fill className="object-cover" sizes="80px"/>:<span className="grid h-full place-items-center text-3xl">📷</span>}</div><div className="min-w-0"><h2 className="text-2xl font-black">{person.full_name||"Fotógrafo"}</h2>{person.instagram_handle&&<p className="text-sm text-red-400">@{person.instagram_handle}</p>}<div className="mt-2 flex flex-wrap gap-2">{publicRoleLabels(person).map(label=><span key={label} className="rounded-full border border-neutral-700 bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-300">{label}</span>)}</div></div></div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-neutral-400">{person.bio||"Profissional da equipe M&M Fotografias."}</p><Link href={`/fotografos/${person.id}`} className="mt-5 block rounded-xl bg-red-600 p-4 text-center font-black">Ver perfil e portfólio</Link></div>
    </article>})}</div>
    {!people?.length&&<p className="rounded-xl border border-neutral-800 p-6 text-neutral-400">Os perfis da equipe aparecerão aqui quando forem publicados.</p>}
  </div></main>;
}
