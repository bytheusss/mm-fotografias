"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const groups = [
  ["GERAL", [["⌂", "Visão geral", "/admin"], ["◉", "Métricas", "/admin/analytics"]]],
  ["CONTEÚDO", [["▣", "Eventos", "/admin/events"], ["↑", "Upload", "/admin/upload"], ["♟", "Fotógrafos", "/admin/collaborators"], ["▥", "Relatório da equipe", "/admin/photographer-report"], ["⇩", "CSV da equipe", "/api/admin/reports/photographers.csv"], ["♜", "Equipe", "/admin/team"]]],
  ["VENDAS", [["▤", "Pedidos", "/admin/orders"], ["◴", "Carrinhos", "/admin/abandoned-carts"], ["↗", "Financeiro", "/admin/finance"], ["◎", "Repasses", "/admin/payouts"]]],
  ["MARKETING", [["$", "Pacotes", "/admin/pricing"], ["%", "Cupons", "/admin/coupons"], ["★", "Promoção", "/admin/promotion"]]],
  ["SISTEMA", [["!", "Central operacional", "/admin/system-health"], ["♲", "Lixeira", "/admin/trash"], ["◈", "LGPD", "/admin/privacy"], ["≡", "Auditoria", "/admin/audit"], ["⇩", "Backup de configurações", "/api/admin/reports/settings.json"], ["⚙", "Integrações", "/admin/integrations"]]],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return <>
    <button type="button" onClick={() => setMobileOpen(true)} className="fixed left-3 top-[calc(5rem+env(safe-area-inset-top))] z-50 grid h-11 w-11 place-items-center rounded-xl border border-neutral-700 bg-neutral-950/95 text-white shadow-xl backdrop-blur lg:hidden" aria-label="Abrir menu administrativo">☰</button>
    {mobileOpen && <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu administrativo" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh max-h-dvh max-w-[88vw] flex-col border-r border-neutral-800 bg-neutral-950 pt-[calc(5rem+env(safe-area-inset-top))] transition-all duration-200 ${collapsed ? "w-20" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <button type="button" onClick={() => setCollapsed(value => !value)} className="absolute right-3 top-24 hidden h-9 w-9 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white lg:block" aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? "›" : "‹"}</button>
      <nav className={`mt-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 [scrollbar-width:thin] ${collapsed ? "px-2" : "px-3"}`}>{groups.map(([group, links]) => <section key={group} className="mb-4">{!collapsed && <p className="mb-1 px-4 text-[10px] font-bold tracking-[.18em] text-neutral-600">{group}</p>}<div className="space-y-1">{links.map(([icon, label, href]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)} key={href} href={href} className={`flex items-center rounded-lg py-2.5 text-sm transition ${collapsed ? "justify-center px-2" : "gap-3 px-4"} ${active ? "bg-red-700 font-bold text-white" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}><span aria-hidden="true" className="w-5 text-center text-base">{icon}</span>{!collapsed && <span>{label}</span>}</Link>; })}</div></section>)}</nav>
      <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 p-4"><Link href="/" title="Voltar ao site" className={`block rounded-lg py-2 text-sm text-neutral-400 hover:bg-neutral-900 hover:text-white ${collapsed ? "text-center" : "px-3"}`}>{collapsed ? "←" : "← Voltar ao site"}</Link></div>
    </aside>
    <div className={`admin-content min-w-0 overflow-x-clip transition-[padding] duration-200 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>{children}</div>
  </>;
}
