"use client";

import { useRouter } from "next/navigation";

export function CouponManager({ coupons, events }: { coupons: Array<any>; events: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  return <div className="space-y-8">
    <form onSubmit={async e => { e.preventDefault(); const form = new FormData(e.currentTarget); const response = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); if (response.ok) { e.currentTarget.reset(); router.refresh(); } else alert((await response.json()).error); }} className="grid gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5 md:grid-cols-3">
      <input name="code" required placeholder="Código" className="rounded bg-black px-3 py-2 uppercase" />
      <select name="kind" className="rounded bg-black px-3 py-2"><option value="percent">Percentual</option><option value="fixed">Valor fixo</option></select>
      <input name="value" required type="number" min="0.01" step="0.01" placeholder="Valor" className="rounded bg-black px-3 py-2" />
      <input name="max_uses" type="number" min="1" placeholder="Limite de usos" className="rounded bg-black px-3 py-2" />
      <select name="event_id" className="rounded bg-black px-3 py-2"><option value="">Todos os eventos</option>{events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}</select>
      <button className="rounded bg-red-600 px-4 py-2 font-bold">Criar cupom</button>
    </form>
    <div className="grid gap-3">{coupons.map(coupon => <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-5"><div><b>{coupon.code}</b><p className="text-sm text-neutral-400">{coupon.kind === "percent" ? `${coupon.value}%` : `R$ ${coupon.value}`} · {coupon.uses}/{coupon.max_uses || "∞"} usos · {coupon.events?.name || "todos os eventos"}</p></div><button onClick={async()=>{await fetch(`/api/admin/coupons/${coupon.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!coupon.active})});router.refresh();}} className="rounded bg-neutral-700 px-4 py-2">{coupon.active ? "Desativar" : "Ativar"}</button></div>)}</div>
  </div>;
}
