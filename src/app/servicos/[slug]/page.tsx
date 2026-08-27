import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { money, serviceBySlug, SERVICE_CATALOG } from "@/lib/service-catalog";
import { ServiceRequestForm } from "@/components/services/ServiceRequestForm";

export function generateStaticParams(){return SERVICE_CATALOG.map(service=>({slug:service.slug}))}
export default async function ServicePage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{pacote?:string}>}){
  const[{slug},query]=await Promise.all([params,searchParams]),service=serviceBySlug(slug);
  if(!service)notFound();
  const selected=service.packages.some(item=>item.slug===query.pacote)?query.pacote:undefined;
  return <main className="min-h-screen bg-black pb-24 pt-20 text-white">
    <section className="relative min-h-[62vh]"><Image src={service.image} alt={`Imagem ilustrativa de ${service.name}`} fill priority className="object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"/><div className="relative mx-auto flex min-h-[62vh] max-w-7xl items-end px-5 pb-12"><div><span className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest">Imagem ilustrativa</span><h1 className="mt-5 text-5xl font-black sm:text-7xl">{service.name}</h1><p className="mt-4 max-w-2xl text-lg text-neutral-200">{service.description}</p></div></div></section>
    <div className="mx-auto max-w-7xl px-4 pt-12">{service.packages.length?<section><p className="font-bold uppercase tracking-widest text-red-500">Pacotes</p><div className="mt-5 grid gap-5 lg:grid-cols-3">{service.packages.map(pack=><article key={pack.slug} className={`relative rounded-2xl border p-6 ${pack.featured?"border-red-600 bg-red-950/20":"border-neutral-800 bg-neutral-950"}`}>{pack.featured&&<span className="absolute -top-3 right-5 rounded-full bg-red-600 px-3 py-1 text-xs font-black">MAIS ESCOLHIDO</span>}<h2 className="text-3xl font-black">{pack.name}</h2><p className="mt-2 text-neutral-400">{pack.tagline}</p><p className="my-6 text-4xl font-black">{money(pack.price!)}</p><div className="mb-5 flex gap-2 text-sm"><span className="rounded-full bg-neutral-900 px-3 py-2">Até {pack.hours}h</span><span className="rounded-full bg-neutral-900 px-3 py-2">{pack.photos} fotos</span></div><ul className="space-y-3 text-neutral-300">{pack.includes.map(item=><li key={item}>✓ {item}</li>)}</ul><Link href={`/servicos/${service.slug}?pacote=${pack.slug}#orcamento`} scroll className="mt-7 block rounded-xl bg-red-600 p-4 text-center font-black">Solicitar este pacote</Link></article>)}</div>
      <div id="orcamento" className="mt-12 scroll-mt-28"><ServiceRequestForm service={service.slug} packageSlug={selected} packages={service.packages.map(({slug:packageSlug,name})=>({slug:packageSlug,name}))}/></div>
    </section>:<section><div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-6"><h2 className="text-3xl font-black">Projeto personalizado</h2><p className="mt-3 text-neutral-400">Os pacotes e valores desta categoria estão sendo preparados. Você já pode solicitar uma proposta personalizada sem compromisso.</p></div><ServiceRequestForm service={service.slug}/></section>}</div>
  </main>
}
