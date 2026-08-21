"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Visão geral", "/admin"], ["Eventos", "/admin/events"], ["Upload", "/admin/upload"], ["Pedidos", "/admin/orders"],
  ["Pacotes", "/admin/pricing"], ["Cupons", "/admin/coupons"], ["Carrinhos", "/admin/abandoned-carts"],
  ["Financeiro", "/admin/finance"], ["Promoção", "/admin/promotion"], ["Auditoria", "/admin/audit"], ["Integrações", "/admin/integrations"],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-neutral-800 bg-neutral-950 pt-28 lg:block"><nav className="space-y-1 px-3">{links.map(([label, href]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`block rounded-lg px-4 py-2.5 text-sm transition ${active ? "bg-red-700 font-bold text-white" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}>{label}</Link>; })}</nav><Link href="/" className="absolute bottom-6 left-7 text-sm text-neutral-500 hover:text-white">← Voltar ao site</Link></aside>;
}
