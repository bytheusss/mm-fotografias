"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Asset = { id: string; url: string; title: string; description: string; category: string; published: boolean; sort_order: number };
const categories = ["Automotivo", "Casamento", "Aniversário", "Ensaio", "Gestante", "Corporativo", "Outros"];

export function PortfolioManager() {
  const [assets, setAssets] = useState<Asset[]>([]), [files, setFiles] = useState<File[]>([]), [category, setCategory] = useState(categories[0]), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const load = () => fetch("/api/profile/portfolio").then((response) => response.json()).then((data) => setAssets(data.assets || []));
  useEffect(() => { void load(); }, []);
  async function upload() {
    if (!files.length) return;
    if (files.length > 16) return setMessage("Selecione no máximo 16 fotos por vez.");
    setBusy(true); let sent = 0; const errors: string[] = [];
    for (const file of files) {
      setMessage(`Enviando ${sent + 1} de ${files.length}: ${file.name}`);
      try {
        const prepareResponse = await fetch("/api/profile/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "prepare", filename: file.name, size: file.size, type: file.type }) });
        const prepared = await prepareResponse.json(); if (!prepareResponse.ok) throw new Error(prepared.error || "Não foi possível preparar o envio.");
        const { error: uploadError } = await supabase.storage.from("portfolio-assets").uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type }); if (uploadError) throw uploadError;
        const finishResponse = await fetch("/api/profile/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "finish", path: prepared.path, filename: file.name, category }) });
        const finished = await finishResponse.json(); if (!finishResponse.ok) throw new Error(finished.error || "Não foi possível processar a foto."); sent++;
      } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : "erro no envio"}`); }
    }
    setMessage(errors.length ? `${sent} enviada(s). ${errors.join(" | ")}` : `${sent} foto(s) adicionada(s) ao portfólio.`);
    if (sent) { setFiles([]); if (inputRef.current) inputRef.current.value = ""; await load(); }
    setBusy(false);
  }
  async function save(asset: Asset) { const response = await fetch("/api/profile/portfolio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...asset, sortOrder: asset.sort_order }) }); setMessage(response.ok ? "Alterações salvas." : "Não foi possível salvar."); }
  async function remove(asset: Asset) { if (!confirm("Excluir esta foto do portfólio?")) return; const response = await fetch("/api/profile/portfolio", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: asset.id }) }); if (response.ok) setAssets((current) => current.filter((item) => item.id !== asset.id)); else setMessage("Não foi possível excluir."); }
  const update = (id: string, changes: Partial<Asset>) => setAssets((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  return <div className="space-y-8"><section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"><h2 className="text-2xl font-black">Adicionar trabalhos autorais</h2><p className="mt-2 text-neutral-400">Estas fotos não precisam pertencer a um evento. Elas aparecem no seu perfil e no Portfólio da M&M.</p><div className="mt-5 grid gap-4 md:grid-cols-[1fr_240px]"><input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif" disabled={busy} onChange={(event) => setFiles(Array.from(event.target.files || []))} className="rounded-lg bg-black p-3"/><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg bg-black p-3">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><p className="mt-2 text-xs text-neutral-500">JPG, PNG, WebP ou HEIC, até 20 MB por foto e 16 fotos por envio.</p><button type="button" onClick={upload} disabled={busy || !files.length} className="mt-4 w-full rounded-xl bg-red-600 p-4 font-black disabled:opacity-50">{busy ? "Enviando…" : `Enviar ${files.length || ""} foto(s)`}</button>{message && <p className="mt-3 rounded-lg bg-black p-3 text-sm" aria-live="polite">{message}</p>}</section><section><h2 className="mb-5 text-2xl font-black">Meu portfólio</h2><div className="grid gap-5 md:grid-cols-2">{assets.map((asset) => <article key={asset.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"><div className="relative aspect-[4/3]"><Image src={asset.url} alt={asset.title || "Foto do portfólio"} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw"/></div><div className="space-y-3 p-4"><input value={asset.title || ""} onChange={(event) => update(asset.id, { title: event.target.value })} placeholder="Título da foto" className="w-full rounded bg-black p-3"/><textarea value={asset.description || ""} onChange={(event) => update(asset.id, { description: event.target.value })} placeholder="Descrição (opcional)" className="w-full rounded bg-black p-3"/><div className="grid grid-cols-[1fr_90px] gap-3"><select value={asset.category} onChange={(event) => update(asset.id, { category: event.target.value })} className="rounded bg-black p-3">{categories.map((item) => <option key={item}>{item}</option>)}</select><input type="number" value={asset.sort_order} onChange={(event) => update(asset.id, { sort_order: Number(event.target.value) })} aria-label="Ordem" className="rounded bg-black p-3"/></div><label className="flex items-center gap-2"><input type="checkbox" checked={asset.published} onChange={(event) => update(asset.id, { published: event.target.checked })}/> Publicar no site</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => save(asset)} className="rounded-lg bg-red-600 p-3 font-bold">Salvar</button><button type="button" onClick={() => remove(asset)} className="rounded-lg border border-neutral-700 p-3">Excluir</button></div></div></article>)}</div>{!assets.length && <p className="rounded-xl border border-neutral-800 p-6 text-neutral-400">Você ainda não adicionou trabalhos independentes.</p>}</section></div>;
}
