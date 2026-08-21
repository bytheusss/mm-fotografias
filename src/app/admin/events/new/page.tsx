"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false); const [stage, setStage] = useState(""); const [error, setError] = useState(""); const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", city: "", event_date: "", published: false });
  function update(name: string, value: string | boolean) { setForm(current => ({ ...current, [name]: value })); }
  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setStage("Criando evento…");
    try {
      const response = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), signal: AbortSignal.timeout(30000) });
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Erro ao criar evento");
      if (cover) {
        setStage("Preparando capa…");
        const signedResponse = await fetch(`/api/admin/events/${data.event.id}/cover-direct`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: cover.size, type: cover.type }), signal: AbortSignal.timeout(30000) });
        const signed = await signedResponse.json().catch(() => ({})); if (!signedResponse.ok) throw new Error(`Evento criado, mas a capa falhou: ${signed.error || "erro ao preparar envio"}`);
        setStage("Enviando capa…");
        const { error: uploadError } = await createClient().storage.from("thumbnails").uploadToSignedUrl(signed.path, signed.token, cover, { contentType: cover.type });
        if (uploadError) throw new Error(`Evento criado, mas a capa falhou: ${uploadError.message}`);
        setStage("Processando capa…");
        const finishResponse = await fetch(`/api/admin/events/${data.event.id}/cover-direct`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: signed.path }), signal: AbortSignal.timeout(90000) });
        const finish = await finishResponse.json().catch(() => ({})); if (!finishResponse.ok) throw new Error(`Evento criado, mas a capa falhou: ${finish.error || "erro no processamento"}`);
      }
      setStage("Evento criado!"); router.push(`/admin/events/${data.event.id}`);
    } catch (problem) { setSaving(false); setStage(""); setError(problem instanceof Error ? problem.message : "Não foi possível criar o evento."); }
  }
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><form onSubmit={create} className="mx-auto max-w-2xl space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-7"><h1 className="text-3xl font-bold">Novo evento</h1><p className="text-sm text-neutral-400">O endereço do evento será criado automaticamente usando o nome e a data.</p><Field label="Nome"><input required disabled={saving} value={form.name} onChange={e => update("name", e.target.value)} className="input" /></Field><Field label="Cidade"><input required disabled={saving} value={form.city} onChange={e => update("city", e.target.value)} className="input" /></Field><Field label="Data"><input required disabled={saving} type="date" value={form.event_date} onChange={e => update("event_date", e.target.value)} className="input" /></Field><Field label="Foto de capa (opcional)"><input disabled={saving} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setCover(e.target.files?.[0] || null)} className="input" /><small className="text-neutral-400">Escolha uma foto do evento. JPG, PNG ou WebP, até 10 MB.</small></Field><label className="flex gap-3"><input disabled={saving} type="checkbox" checked={form.published} onChange={e => update("published", e.target.checked)} /> Publicar imediatamente</label>{stage && <p className="rounded bg-neutral-800 p-3 text-center text-neutral-200" aria-live="polite">{stage}</p>}{error && <p className="rounded bg-red-950 p-3 text-red-200">{error}</p>}<button disabled={saving} className="w-full rounded-lg bg-red-600 py-3 font-bold disabled:opacity-50">{saving ? stage || "Criando…" : "Criar evento"}</button></form></main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span>{label}</span>{children}</label>; }
