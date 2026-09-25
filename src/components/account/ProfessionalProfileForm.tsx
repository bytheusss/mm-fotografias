"use client";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Photo = { id: string; number: number; thumbnail: string };
type Initial = { name: string; bio: string; instagram: string; avatarUrl: string; publicProfile: boolean; publicTitle: string; whatsapp: string; availability: string; monthlyGoal: number; featuredPhotoIds: string[] };

export function ProfessionalProfileForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState(initial), [file, setFile] = useState<File | null>(null), [photos, setPhotos] = useState<Photo[]>([]), [message, setMessage] = useState(""), [saving, setSaving] = useState(false);
  useEffect(() => { fetch("/api/profile/professional").then((response) => response.json()).then((data) => setPhotos(data.photos || [])).catch(() => undefined); }, []);
  const preview = useMemo(() => file ? URL.createObjectURL(file) : form.avatarUrl, [file, form.avatarUrl]);
  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  function field(key: keyof Initial, value: string | number | boolean | string[]) { setForm((current) => ({ ...current, [key]: value })); }
  function toggle(id: string) { field("featuredPhotoIds", form.featuredPhotoIds.includes(id) ? form.featuredPhotoIds.filter((item) => item !== id) : form.featuredPhotoIds.length < 12 ? [...form.featuredPhotoIds, id] : form.featuredPhotoIds); }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(file ? "Enviando sua foto…" : "Salvando perfil…");
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.set(key, key === "featuredPhotoIds" ? JSON.stringify(value) : String(value)));
      if (file) {
        const prepare = await fetch("/api/profile/professional", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "prepare-avatar", size: file.size, type: file.type }) });
        const prepared = await prepare.json();
        if (!prepare.ok) throw new Error(prepared.error || "Não foi possível preparar a foto.");
        const { error } = await supabase.storage.from("profile-photos").uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type });
        if (error) throw error;
        body.set("avatarPath", prepared.path);
      }
      const response = await fetch("/api/profile/professional", { method: "PUT", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar.");
      setMessage("Perfil e estúdio atualizados.");
      if (data.avatarUrl) { field("avatarUrl", data.avatarUrl); setFile(null); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao salvar."); }
    finally { setSaving(false); }
  }

  return <form onSubmit={save} className="mt-7 space-y-5 rounded-xl border border-red-900/60 bg-neutral-900 p-6"><h2 className="text-2xl font-black">Perfil profissional e portfólio</h2><div className="flex flex-col gap-5 sm:flex-row"><div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-neutral-800">{preview ? <Image src={preview} alt="Prévia" fill unoptimized className="object-cover"/> : <span className="grid h-full place-items-center text-4xl">📷</span>}</div><div className="min-w-0 flex-1"><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => setFile(event.target.files?.[0] || null)} className="max-w-full"/><p className="mt-2 text-xs text-neutral-500">JPG, PNG, WebP ou HEIC, até 20 MB. A foto fica salva permanentemente no site.</p><input type="url" value={form.avatarUrl} onChange={(event) => field("avatarUrl", event.target.value)} className="mt-3 w-full rounded bg-black p-3" placeholder="Ou link direto da foto"/></div></div><div className="grid gap-4 sm:grid-cols-2"><input required value={form.name} onChange={(event) => field("name", event.target.value)} className="rounded bg-black p-3" placeholder="Nome profissional"/><input value={form.publicTitle} onChange={(event) => field("publicTitle", event.target.value)} className="rounded bg-black p-3" placeholder="Título: Fotógrafo automotivo"/><input value={form.instagram} onChange={(event) => field("instagram", event.target.value)} className="rounded bg-black p-3" placeholder="Instagram"/><input value={form.whatsapp} onChange={(event) => field("whatsapp", event.target.value)} className="rounded bg-black p-3" placeholder="WhatsApp profissional"/><input value={form.availability} onChange={(event) => field("availability", event.target.value)} className="rounded bg-black p-3 sm:col-span-2" placeholder="Disponibilidade e próximos eventos"/><input type="number" min="0" step="100" value={form.monthlyGoal} onChange={(event) => field("monthlyGoal", Number(event.target.value))} className="rounded bg-black p-3" placeholder="Meta mensal R$"/></div><textarea maxLength={500} rows={5} value={form.bio} onChange={(event) => field("bio", event.target.value)} className="w-full rounded bg-black p-3" placeholder="Bio"/><label className="flex gap-3"><input type="checkbox" checked={form.publicProfile} onChange={(event) => field("publicProfile", event.target.checked)}/>Mostrar em Quem somos</label>{photos.length > 0 && <section><h3 className="font-bold">Destaques do portfólio ({form.featuredPhotoIds.length}/12)</h3><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{photos.map((photo) => <button type="button" key={photo.id} onClick={() => toggle(photo.id)} className={`relative aspect-square overflow-hidden rounded border-2 ${form.featuredPhotoIds.includes(photo.id) ? "border-red-500" : "border-transparent"}`}><Image src={photo.thumbnail} alt={`Foto ${photo.number}`} fill className="object-cover"/></button>)}</div></section>}<button disabled={saving} className="rounded bg-red-600 px-5 py-3 font-bold disabled:opacity-50">{saving ? "Salvando…" : "Salvar tudo"}</button>{message && <p aria-live="polite">{message}</p>}</form>;
}
