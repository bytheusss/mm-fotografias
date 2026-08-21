"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", city: "", event_date: "", published: false });
  function update(name: string, value: string | boolean) { setForm(current => ({ ...current, [name]: value })); }
  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const response = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json();
    if (!response.ok) { setSaving(false); return setError(data.error || "Erro ao criar evento"); }
    if (cover) {
      const upload = new FormData(); upload.append("file", cover); upload.append("event_id", data.event.id);
      const coverResponse = await fetch("/api/admin/events/upload-cover", { method: "POST", body: upload }); const coverData = await coverResponse.json();
      if (!coverResponse.ok) { setSaving(false); setError(`Evento criado, mas a capa falhou: ${coverData.error || "erro no envio"}. Você pode adicioná-la na edição.`); return; }
    }
    router.push(`/admin/events/${data.event.id}`);
  }
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><form onSubmit={create} className="mx-auto max-w-2xl space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-7"><h1 className="text-3xl font-bold">Novo evento</h1><p className="text-sm text-neutral-400">O endereço do evento será criado automaticamente usando o nome e a data.</p><Field label="Nome"><input required value={form.name} onChange={e => update("name", e.target.value)} className="input" /></Field><Field label="Cidade"><input required value={form.city} onChange={e => update("city", e.target.value)} className="input" /></Field><Field label="Data"><input required type="date" value={form.event_date} onChange={e => update("event_date", e.target.value)} className="input" /></Field><Field label="Foto de capa (opcional)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setCover(e.target.files?.[0] || null)} className="input" /><small className="text-neutral-400">Escolha uma foto do evento. JPG, PNG ou WebP, até 10 MB.</small></Field><label className="flex gap-3"><input type="checkbox" checked={form.published} onChange={e => update("published", e.target.checked)} /> Publicar imediatamente</label>{error && <p className="rounded bg-red-950 p-3 text-red-200">{error}</p>}<button disabled={saving} className="w-full rounded-lg bg-red-600 py-3 font-bold disabled:opacity-50">{saving ? "Criando..." : "Criar evento"}</button></form></main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span>{label}</span>{children}</label>; }
