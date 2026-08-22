"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  ["⌂", "Visão geral", "/admin"], ["▣", "Eventos", "/admin/events"], ["↑", "Upload", "/admin/upload"],
  ["▤", "Pedidos", "/admin/orders"], ["$", "Pacotes", "/admin/pricing"], ["%", "Cupons", "/admin/coupons"],
  ["◴", "Carrinhos", "/admin/abandoned-carts"], ["↗", "Financeiro", "/admin/finance"],
  ["◉", "Métricas", "/admin/analytics"],
  ["♟", "Fotógrafos", "/admin/collaborators"],
  ["★", "Promoção", "/admin/promotion"], ["≡", "Auditoria", "/admin/audit"], ["⚙", "Integrações", "/admin/integrations"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return <>
    <button type="button" onClick={() => setMobileOpen(true)} className="fixed left-3 top-24 z-50 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white lg:hidden" aria-label="Abrir menu administrativo">☰</button>
    {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu administrativo" />}
    <aside className={`fixed inset-y-0 left-0 z-50 border-r border-neutral-800 bg-neutral-950 pt-24 transition-all duration-200 ${collapsed ? "w-20" : "w-60"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <button type="button" onClick={() => setCollapsed(value => !value)} className="absolute right-3 top-24 hidden h-9 w-9 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white lg:block" aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? "›" : "‹"}</button>
      <nav className={`mt-12 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>{links.map(([icon, label, href]) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return <Link title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)} key={href} href={href} className={`flex items-center rounded-lg py-2.5 text-sm transition ${collapsed ? "justify-center px-2" : "gap-3 px-4"} ${active ? "bg-red-700 font-bold text-white" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}><span aria-hidden="true" className="w-5 text-center text-base">{icon}</span>{!collapsed && <span>{label}</span>}</Link>;
      })}</nav>
      <Link href="/" title="Voltar ao site" className={`absolute bottom-6 text-sm text-neutral-500 hover:text-white ${collapsed ? "left-0 right-0 text-center" : "left-7"}`}>{collapsed ? "←" : "← Voltar ao site"}</Link>
    </aside>
    <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-20" : "lg:pl-60"}`}>{children}</div>
  </>;
}
