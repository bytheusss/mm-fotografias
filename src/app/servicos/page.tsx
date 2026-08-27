import Image from "next/image";
import Link from "next/link";
import { SERVICE_CATALOG } from "@/lib/service-catalog";

export default function ServicesPage(){return <main className="min-h-screen bg-black px-4 pb-24 pt-32 text-white"><div className="mx-auto max-w-7xl">
  <p className="font-bold uppercase tracking-[.2em] text-red-500">Ensaios e coberturas</p>
  <h1 className="mt-3 max-w-4xl text-4xl font-black sm:text-6xl">Sua história merece ser lembrada do jeito certo.</h1>
  <p className="mt-5 max-w-2xl text-lg text-neutral-400">Ensaios e coberturas planejados com cuidado, direção e uma experiência simples do orçamento à entrega.</p>
  <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SERVICE_CATALOG.map(service=><Link href={`/servicos/${service.slug}`} key={service.slug} className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950"><div className="relative aspect-[3/2] overflow-hidden"><Image src={service.image} alt={`Imagem ilustrativa de ${service.name}`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw"/><span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs backdrop-blur">Imagem ilustrativa</span></div><div className="p-5"><h2 className="text-2xl font-black">{service.name}</h2><p className="mt-2 text-neutral-400">{service.short}</p><span className="mt-5 inline-block font-bold text-red-500">Conhecer e solicitar →</span></div></Link>)}</div>
</div></main>}
