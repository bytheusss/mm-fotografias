import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { LogoutButton } from "@/components/account/LogoutButton";
import { money, orderPhotos, statusLabel } from "@/lib/orders";
import { hasRole } from "@/lib/roles";

export default async function Page() {
  const user = await requireUser();
  const email = user.email?.toLowerCase();
  const { data: profile } = await supabaseAdmin.from("profiles").select("full_name,phone,role,roles").eq("id", user.id).maybeSingle();
  const { data: orders, error } = await supabaseAdmin.from("orders").select("id,status,total,photos,download_token,created_at,user_id").or(`user_id.eq.${user.id}${email ? `,and(user_id.is.null,email.ilike.${email})` : ""}`).order("created_at", { ascending: false });
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-5xl">
    <header className="mb-10 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-4xl font-bold">Minha Conta</h1><p className="mt-2 text-neutral-400">Olá, {profile?.full_name || user.user_metadata?.name || "cliente"}.</p></div><div className="flex flex-wrap gap-3">{hasRole(profile,["owner","admin"]) && <Link className="rounded-lg bg-red-700 px-4 py-2 font-bold" href="/admin">Abrir painel administrativo</Link>}{hasRole(profile,["photographer"]) && <Link className="rounded-lg bg-red-700 px-4 py-2 font-bold" href="/fotografo">Portal do fotógrafo</Link>}<Link className="rounded-lg bg-neutral-800 px-4 py-2" href="/minha-conta/privacidade">Meus dados e LGPD</Link><Link className="rounded-lg bg-neutral-800 px-4 py-2" href="/minha-conta/perfil">Editar perfil</Link><LogoutButton /></div></header>
    <h2 className="mb-5 text-2xl font-bold">Meus pedidos</h2>
    {error && <p className="rounded-lg bg-red-950 p-4">Não foi possível carregar seus pedidos.</p>}
    {!error && !orders?.length && <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-neutral-400">Você ainda não possui pedidos.</p>}
    <div className="grid gap-5">{orders?.map(order => <article key={order.id} className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6"><div><h3 className="text-xl font-bold">Pedido #{String(order.id).slice(0,8).toUpperCase()}</h3><p className="mt-2 text-neutral-400">{new Date(order.created_at).toLocaleDateString("pt-BR")} · {orderPhotos(order.photos).length} foto(s) · {money(order.total)}</p><p className="mt-2">{statusLabel(order.status)}</p></div><div className="flex flex-wrap gap-3"><Link href={`/minha-conta/pedido/${order.id}`} className="rounded-lg bg-neutral-700 px-4 py-3 font-bold">Ver pedido</Link>{order.status === "paid" && order.download_token && <Link href={`/download/${order.download_token}`} className="rounded-lg bg-green-700 px-4 py-3 font-bold">Baixar fotos</Link>}</div></article>)}</div>
  </div></main>;
}
