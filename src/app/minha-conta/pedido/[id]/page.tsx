import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { money, orderPhotos, statusLabel } from "@/lib/orders";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/minha-conta/pedido/${id}`);
  const { data: order } = await supabaseAdmin.from("orders").select("id,email,user_id,status,total,photos,download_token,created_at").eq("id", id).maybeSingle();
  if (!order || (order.user_id !== user.id && (order.user_id || order.email?.toLowerCase() !== user.email?.toLowerCase()))) notFound();
  const photos = orderPhotos(order.photos);
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-5xl"><Link href="/minha-conta" className="text-neutral-400">← Minha Conta</Link><div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6"><h1 className="text-3xl font-bold">Pedido #{String(order.id).slice(0,8).toUpperCase()}</h1><div className="mt-4 grid gap-2 text-neutral-300 sm:grid-cols-3"><p>{new Date(order.created_at).toLocaleString("pt-BR")}</p><p>{statusLabel(order.status)}</p><p>{money(order.total)}</p></div>{order.status === "paid" && order.download_token ? <Link href={`/download/${order.download_token}`} className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-bold">Baixar todas</Link> : order.status === "paid" ? <p className="mt-6 rounded-lg bg-amber-950 p-4">Pagamento confirmado. O link de download está sendo preparado.</p> : null}</div><h2 className="my-6 text-2xl font-bold">Fotografias</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{photos.map((photo,index) => <div key={photo.id || index} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900"><div className="relative aspect-square">{(photo.thumbnail_url || photo.imagem) ? <Image src={photo.thumbnail_url || photo.imagem!} alt={`Foto ${photo.numero || index+1}`} fill className="object-cover" /> : <div className="grid h-full place-items-center text-neutral-500">Sem miniatura</div>}</div><p className="p-3 text-sm">Foto #{photo.numero || index+1}</p></div>)}</div></div></main>;
}
