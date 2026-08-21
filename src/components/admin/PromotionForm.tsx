"use client";
import { useState } from "react";

type Settings = { active: boolean; message: string; link_url: string | null; link_label: string | null };
export function PromotionForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial); const [status, setStatus] = useState("");
  async function save(e: React.FormEvent) { e.preventDefault(); setStatus("Salvando…"); const response = await fetch("/api/admin/promotion", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const result = await response.json(); setStatus(response.ok ? "Salvo com sucesso." : result.error || "Erro ao salvar."); }
  return <form onSubmit={save} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
    <label className="flex gap-3"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Exibir faixa promocional no site</label>
    <label className="block">Mensagem<input required={form.active} maxLength={180} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-2 w-full rounded-lg border border-neutral-700 bg-black p-3" /></label>
    <label className="block">Link (opcional)<input value={form.link_url || ""} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="/eventos ou https://..." className="mt-2 w-full rounded-lg border border-neutral-700 bg-black p-3" /></label>
    <label className="block">Texto do link<input maxLength={40} value={form.link_label || ""} onChange={e => setForm({ ...form, link_label: e.target.value })} className="mt-2 w-full rounded-lg border border-neutral-700 bg-black p-3" /></label>
    <button className="rounded-lg bg-red-600 px-5 py-3 font-bold">Salvar promoção</button>{status && <p aria-live="polite" className="text-sm text-neutral-300">{status}</p>}
  </form>;
}
