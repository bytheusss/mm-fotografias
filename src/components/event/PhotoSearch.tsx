"use client";

import { useEffect, useMemo, useState } from "react";
import { PhotoCard } from "@/components/ui/PhotoCard";
import type { EventPhoto } from "@/types";
import { GalleryLightbox } from "@/components/event/GalleryLightbox";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";

interface PhotoSearchProps {
  photos: EventPhoto[];
}

export function PhotoSearch({ photos }: PhotoSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 40;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [photographer, setPhotographer] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [lastPhoto, setLastPhoto] = useState<{ id: string; numero: string } | null>(null);
  const { addToCart, items } = useCart();
  function toggleSelection(id: string) { setSelected(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  const photographerOptions = useMemo(() => [...new Map(photos.filter(photo => photo.photographerId).map(photo => [photo.photographerId!, photo.photographerName || "Fotógrafo"])).entries()], [photos]);
  const categoryOptions = useMemo(() => [...new Set(photos.map(photo => photo.category || "Geral"))].sort(), [photos]);
  const filteredPhotos = useMemo(() => {
    const value = search.replace(/\D/g, "");

    if (!value) {
      return photos.filter(photo => photographer === "all" || photo.photographerId === photographer).filter(photo => category === "all" || (photo.category || "Geral") === category).sort((a, b) => sort === "asc" ? Number(a.numero) - Number(b.numero) : Number(b.numero) - Number(a.numero));
    }

    return photos.filter((photo) => photographer === "all" || photo.photographerId === photographer).filter(photo => category === "all" || (photo.category || "Geral") === category).filter((photo) => {
      const number = String(photo.numero).padStart(4, "0");

      return number.includes(value.padStart(4, "0"));
    }).sort((a, b) => sort === "asc" ? Number(a.numero) - Number(b.numero) : Number(b.numero) - Number(a.numero));
  }, [photos, search, sort, photographer, category]);
  const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / pageSize));
  const currentPage = Math.min(totalPages, Math.max(1, Number(searchParams.get("pagina") || 1)));
  const pagePhotos = filteredPhotos.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  function goToPage(page: number) { const params = new URLSearchParams(searchParams.toString()); if (page <= 1) params.delete("pagina"); else params.set("pagina", String(page)); router.push(`?${params.toString()}`, { scroll: true }); }
  function selectRange() { const start = Number(rangeStart); const end = Number(rangeEnd); if (!start || !end || start > end) return; setSelected(current => { const next = new Set(current); filteredPhotos.filter(photo => Number(photo.numero) >= start && Number(photo.numero) <= end).forEach(photo => next.add(photo.id)); return next; }); }
  function addSelected() { filteredPhotos.filter(photo => selected.has(photo.id)).forEach(addToCart); setSelected(new Set()); setSelectionMode(false); }
  useEffect(() => { const slug = photos[0]?.slug; if (!slug) return; const timer = window.setTimeout(() => { try { const saved = JSON.parse(localStorage.getItem(`mm-last-photo-${slug}`) || "null"); if (saved?.id && photos.some(photo => photo.id === saved.id)) setLastPhoto(saved); } catch { /* preferência local inválida */ } }, 0); return () => window.clearTimeout(timer); }, [photos]);

  return (
    <div>
      {lastPhoto && <button type="button" onClick={() => setSelectedId(lastPhoto.id)} className="mb-5 flex w-full items-center justify-between gap-4 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-left transition hover:bg-red-950/50"><span><b className="block">Continue de onde parou</b><span className="text-sm text-neutral-400">Abrir novamente a foto #{lastPhoto.numero}</span></span><span className="text-2xl" aria-hidden="true">→</span></button>}
      <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto]">
        <input
          type="text"
          inputMode="numeric"
          placeholder="🔍 Buscar foto pelo número..."
          value={search}
          onChange={(e) =>
            { setSearch(e.target.value.replace(/\D/g, "")); goToPage(1); }
          }
          className="
            w-full
            rounded-lg
            border
            border-neutral-700
            bg-neutral-900
            px-5
            py-4
            text-lg
            text-white
            placeholder:text-neutral-500
            focus:border-red-600
            focus:outline-none
          "
        />
        <select aria-label="Ordenação das fotos" value={sort} onChange={e => { setSort(e.target.value as "asc" | "desc"); goToPage(1); }} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"><option value="asc">Número crescente</option><option value="desc">Número decrescente</option></select>
        {photographerOptions.length > 1 && <select aria-label="Filtrar por fotógrafo" value={photographer} onChange={event => { setPhotographer(event.target.value); goToPage(1); }} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"><option value="all">Todos os fotógrafos</option>{photographerOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>}
        {categoryOptions.length > 1 && <select aria-label="Filtrar por categoria" value={category} onChange={event => { setCategory(event.target.value); goToPage(1); }} className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"><option value="all">Todas as áreas</option>{categoryOptions.map(item => <option key={item} value={item}>{item}</option>)}</select>}
        <button type="button" onClick={() => { setSelectionMode(value => !value); setSelected(new Set()); }} className={`whitespace-nowrap rounded-lg px-4 py-3 font-bold ${selectionMode ? "bg-red-700" : "bg-neutral-800"}`}>{selectionMode ? "Cancelar seleção" : "Selecionar várias"}</button>
      </div>
      {selectionMode && <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4"><label className="text-sm text-neutral-400">Da foto<input value={rangeStart} onChange={event => setRangeStart(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Ex.: 40" className="mt-1 block w-28 rounded bg-black p-2 text-white" /></label><label className="text-sm text-neutral-400">Até a foto<input value={rangeEnd} onChange={event => setRangeEnd(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Ex.: 60" className="mt-1 block w-28 rounded bg-black p-2 text-white" /></label><button type="button" onClick={selectRange} className="rounded bg-neutral-700 px-4 py-2 font-bold">Selecionar intervalo</button><button type="button" onClick={() => setSelected(new Set(pagePhotos.map(photo => photo.id)))} className="rounded bg-neutral-700 px-4 py-2 font-bold">Selecionar página</button></div>}

      {filteredPhotos.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 py-16 text-center">
          <p className="text-lg text-neutral-400">
            Nenhuma foto encontrada.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-2
            gap-2
            sm:gap-3
            md:gap-4
            md:grid-cols-3
            lg:grid-cols-5
          "
        >
          {pagePhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onView={() => setSelectedId(photo.id)}
              selectionMode={selectionMode}
              selected={selected.has(photo.id)}
              onSelect={() => toggleSelection(photo.id)}
            />
          ))}
        </div>
      )}
      {filteredPhotos.length > pageSize && <nav aria-label="Paginação das fotos" className="mt-10 flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} className="rounded bg-neutral-800 px-4 py-2 disabled:opacity-40">← Anterior</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map(page => <button type="button" key={page} onClick={() => goToPage(page)} aria-current={page === currentPage ? "page" : undefined} className={`h-10 min-w-10 rounded px-3 font-bold ${page === currentPage ? "bg-red-600" : "bg-neutral-800"}`}>{page}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} className="rounded bg-neutral-800 px-4 py-2 disabled:opacity-40">Próxima →</button><span className="w-full text-center text-sm text-neutral-500">Página {currentPage} de {totalPages} · {filteredPhotos.length} fotos</span></nav>}
      {selectedId && <GalleryLightbox photos={pagePhotos} index={Math.max(0, pagePhotos.findIndex(photo => photo.id === selectedId))} onIndexChange={index => setSelectedId(pagePhotos[index]?.id || null)} onClose={() => setSelectedId(null)} />}
      {selectionMode && <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-neutral-700 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur"><div><b>{selected.size} selecionada(s)</b><p className="text-xs text-neutral-400">Carrinho atual: {items.length}</p></div><button type="button" disabled={!selected.size} onClick={addSelected} className="rounded-lg bg-red-600 px-5 py-3 font-bold disabled:opacity-50">Adicionar todas</button></div>}
    </div>
  );
}
