"use client";

import { useEffect, useState } from "react";

export default function PhotoManager({
  eventId,
}: {
  eventId: string;
}) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [protecting, setProtecting] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [photographers, setPhotographers] = useState<Array<{ id: string; name: string }>>([]);

  async function load(p = page) {
    const res = await fetch(
      `/api/admin/events/${eventId}/photos?page=${p}`
    );

    const data = await res.json();

    setPhotos(data.photos);
    setPages(data.pages);
    setPage(data.page);
    setSelected(new Set());
  }

  useEffect(() => {
    load(1);
    fetch(`/api/admin/events/${eventId}/photographers`).then(response => response.json()).then(data => setPhotographers(data.photographers || [])).catch(() => undefined);
  }, []);

  async function remove(id: string) {
    if (!confirm("Excluir foto?")) return;

    await fetch(`/api/admin/photos/${id}`, {
      method: "DELETE",
    });

    load(page);
  }
  function toggle(id: string) { setSelected(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  async function batch(action: "trash" | "hide" | "publish") { if (!selected.size) return; if (action === "trash" && !confirm(`Mover ${selected.size} fotos para a lixeira?`)) return; const response = await fetch("/api/admin/photos/batch", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [...selected], action }) }); const data = await response.json(); setMessage(response.ok ? `${selected.size} fotos atualizadas.` : data.error || "Erro."); if (response.ok) await load(page); }
  async function assign(photographerId: string) { if (!selected.size || !photographerId) return; const response = await fetch("/api/admin/photos/batch", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [...selected], action: "assign", photographerId }) }); setMessage(response.ok ? `Autoria aplicada em ${selected.size} fotos.` : "Erro ao atribuir autoria."); if (response.ok) await load(page); }
  async function categorize(category: string) { if (!selected.size || !category.trim()) return; const response = await fetch("/api/admin/photos/batch", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [...selected], action: "category", category }) }); setMessage(response.ok ? `Categoria aplicada em ${selected.size} fotos.` : "Erro ao definir categoria."); if (response.ok) await load(page); }

  async function protect(id: string) { const response = await fetch(`/api/admin/events/${eventId}/photos/${id}`, { method: "PATCH" }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Falha ao reforçar proteção."); }
  async function protectPage() { if (!confirm(`Reprocessar as ${photos.length} fotos desta página usando os originais?`)) return; setProtecting(true); setMessage(""); let done = 0; try { for (const photo of photos) { setMessage(`Protegendo ${done + 1} de ${photos.length}…`); await protect(photo.id); done += 1; } setMessage(`${done} fotos atualizadas. Atualize a página pública para conferir.`); } catch (error) { setMessage(`${done} concluídas. ${error instanceof Error ? error.message : "Erro"}`); } finally { setProtecting(false); } }

  return (
    <div className="mt-12">

      <h2 className="text-2xl font-bold mb-5">
        Todas as fotos
      </h2>
      <div className="mb-5 flex flex-wrap items-center gap-3"><button type="button" disabled={protecting || !photos.length} onClick={protectPage} className="rounded bg-blue-700 px-4 py-2 font-bold disabled:opacity-50">{protecting ? "Processando…" : "Reforçar marca desta página"}</button><span className="text-sm text-neutral-400">Usa o original, portanto não duplica marcas existentes.</span></div>{message && <p className="mb-5 rounded bg-neutral-900 p-3 text-sm">{message}</p>}
      <div className="sticky top-24 z-30 mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950/95 p-3 backdrop-blur"><button onClick={() => setSelected(new Set(photos.map(photo => photo.id)))} className="rounded bg-neutral-700 px-3 py-2 text-sm font-bold">Selecionar página</button><button onClick={() => setSelected(new Set())} className="rounded bg-neutral-800 px-3 py-2 text-sm">Limpar</button><span className="mr-auto text-sm text-neutral-400">{selected.size} selecionada(s)</span><button disabled={!selected.size} onClick={() => batch("publish")} className="rounded bg-green-700 px-3 py-2 text-sm font-bold disabled:opacity-40">Publicar</button><button disabled={!selected.size} onClick={() => batch("hide")} className="rounded bg-yellow-700 px-3 py-2 text-sm font-bold disabled:opacity-40">Ocultar</button><button disabled={!selected.size} onClick={() => batch("trash")} className="rounded bg-red-700 px-3 py-2 text-sm font-bold disabled:opacity-40">Lixeira</button></div>
      {photographers.length > 0 && selected.size > 0 && <div className="mb-5 flex items-center gap-3 rounded-lg bg-neutral-900 p-3"><span className="text-sm">Definir fotógrafo:</span><select defaultValue="" onChange={event => { void assign(event.target.value); event.target.value = ""; }} className="rounded bg-black p-2"><option value="">Selecione…</option>{photographers.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></div>}
      {selected.size > 0 && <form onSubmit={event => { event.preventDefault(); const form = event.currentTarget; const value = new FormData(form).get("category"); if (typeof value === "string") void categorize(value); form.reset(); }} className="mb-5 flex flex-col gap-3 rounded-lg bg-neutral-900 p-3 sm:flex-row sm:items-center"><label className="text-sm">Definir categoria:</label><input name="category" required maxLength={60} placeholder="Ex.: Pista" className="min-w-0 flex-1 rounded bg-black p-2"/><button className="rounded bg-neutral-700 px-4 py-2 font-bold">Aplicar</button></form>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

        {photos.map(photo => (

          <div
            key={photo.id}
            className="relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800"
          >
            <label className="absolute z-20 m-2 grid h-9 w-9 place-items-center rounded-full bg-black/80"><input type="checkbox" checked={selected.has(photo.id)} onChange={() => toggle(photo.id)} aria-label={`Selecionar foto ${photo.number}`} /></label>

            <img
              alt={`Foto ${String(photo.number).padStart(4, "0")}`}
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.thumbnail_path}`}
              className="aspect-square object-cover w-full"
            />

            <div className="p-3">

              <p className="font-bold">
                #{String(photo.number).padStart(4, "0")}
              </p>

              <p className="text-sm text-neutral-400 mb-3">
                {photo.status}
              </p>

              <button
                type="button"
                disabled={protecting}
                onClick={async () => { setProtecting(true); try { await protect(photo.id); setMessage(`Foto #${String(photo.number).padStart(4, "0")} atualizada.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Erro"); } finally { setProtecting(false); } }}
                className="mb-2 w-full rounded bg-blue-700 py-2 disabled:opacity-50"
              >
                Reforçar marca
              </button>

              <button
                onClick={() => remove(photo.id)}
                className="w-full bg-red-600 py-2 rounded"
              >
                Excluir
              </button>

            </div>

          </div>

        ))}

      </div>

      <div className="flex justify-center gap-3 mt-8">

        <button
          disabled={page == 1}
          onClick={() => load(page - 1)}
          className="bg-neutral-700 px-4 py-2 rounded"
        >
          ←
        </button>

        <span>
          {page} / {pages}
        </span>

        <button
          disabled={page == pages}
          onClick={() => load(page + 1)}
          className="bg-neutral-700 px-4 py-2 rounded"
        >
          →
        </button>

      </div>

    </div>
  );
}
