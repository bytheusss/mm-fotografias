"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({ initial }: { initial: { id: string; email: string; name: string; whatsapp: string } }) {
  const [name, setName] = useState(initial.name);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [message, setMessage] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault(); setMessage("Salvando...");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: name.trim(), phone: whatsapp.trim() }).eq("id", initial.id);
    if (!error) await supabase.auth.updateUser({ data: { name: name.trim(), whatsapp: whatsapp.trim() } });
    setMessage(error ? "Não foi possível salvar o perfil." : "Perfil salvo.");
  }
  return <form onSubmit={save} className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
    <label className="block">Nome<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-black px-4 py-3" /></label>
    <label className="block">WhatsApp<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-black px-4 py-3" /></label>
    <label className="block">E-mail<input disabled value={initial.email} className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-400" /></label>
    {message && <p role="status">{message}</p>}
    <button className="rounded-lg bg-red-600 px-5 py-3 font-bold">Salvar</button>
  </form>;
}
