import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { publicRoleLabels } from "@/lib/roles";

export const dynamic = "force-dynamic";
export default async function PhotographersPage() {
  const { data: people } = await supabaseAdmin.from("profiles").select("id,full_name,bio,instagram_handle,avatar_url,role,roles").contains("roles", ["photographer"]).eq("public_profile", true).order("full_name");
  return <main className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:px-6"><div className="mx-auto max-w-6xl">
    <p className="text-sm font-bold uppercase tracking-widest text-red-500">Equipe M&amp;M</p><h1 className="text-4xl font-black sm:text-5xl">Quem somos</h1><p className="mb-10 mt-3 max-w-2xl text-neutral-400">Conheça as pessoas por trás das imagens, suas histórias e os eventos que cada profissional registrou.</p>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(people || []).map(person => <Link href={`/fotografos/${person.id}`} key={person.id} className="group rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:-translate-y-1 hover:border-red-700"><div className="flex gap-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-neutral-800">{person.avatar_url ? <Image src={person.avatar_url} alt="" fill className="object-cover" sizes="80px" /> : <span className="grid h-full place-items-center text-3xl">📷</span>}</div><div className="min-w-0"><h2 className="text-xl font-bold">{person.full_name || "Fotógrafo"}</h2>{person.instagram_handle && <p className="text-sm text-red-400">@{person.instagram_handle}</p>}</div></div><div className="mt-4 flex flex-wrap gap-2">{publicRoleLabels(person).map(label => <span key={label} className="rounded-full border border-neutral-700 bg-black px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-300 group-hover:border-red-900">{label}</span>)}</div><p className="mt-3 line-clamp-3 text-sm text-neutral-400">{person.bio || "Profissional da equipe M&M Fotografias."}</p></Link>)}</div>
    {!people?.length && <p className="rounded-xl border border-neutral-800 p-6 text-neutral-400">Os perfis da equipe aparecerão aqui quando forem publicados.</p>}
  </div></main>;
}
