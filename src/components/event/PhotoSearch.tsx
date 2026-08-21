"use client";

import { useMemo, useState } from "react";
import { PhotoCard } from "@/components/ui/PhotoCard";
import type { EventPhoto } from "@/types";
import { GalleryLightbox } from "@/components/event/GalleryLightbox";
import { useCart } from "@/context/CartContext";

interface PhotoSearchProps {
  photos: EventPhoto[];
}

export function PhotoSearch({ photos }: PhotoSearchProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const { addToCart, items } = useCart();
  function toggleSelection(id: string) { setSelected(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  const filteredPhotos = useMemo(() => {
    const value = search.replace(/\D/g, "");

    if (!value) {
      return [...photos].sort((a, b) => sort === "asc" ? Number(a.numero) - Number(b.numero) : Number(b.numero) - Number(a.numero));
    }

    return photos.filter((photo) => {
      const number = String(photo.numero).padStart(4, "0");

      return number.includes(value.padStart(4, "0"));
    }).sort((a, b) => sort === "asc" ? Number(a.numero) - Number(b.numero) : Number(b.numero) - Number(a.numero));
  }, [photos, search, sort]);
  function addSelected() { filteredPhotos.filter(photo => selected.has(photo.id)).forEach(addToCart); setSelected(new Set()); setSelectionMode(false); }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          inputMode="numeric"
          placeholder="🔍 Buscar foto pelo número..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value.replace(/\D/g, ""))
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
        <select aria-label="Ordenação das fotos" value={sort} onChange={e => setSort(e.target.value as "asc" | "desc")} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"><option value="asc">Número crescente</option><option value="desc">Número decrescente</option></select>
        <button type="button" onClick={() => { setSelectionMode(value => !value); setSelected(new Set()); }} className={`rounded-lg px-4 py-3 font-bold ${selectionMode ? "bg-red-700" : "bg-neutral-800"}`}>{selectionMode ? "Cancelar seleção" : "Selecionar várias"}</button>
      </div>

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
            gap-4
            md:grid-cols-3
            lg:grid-cols-5
          "
        >
          {filteredPhotos.map((photo) => (
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
      {selectedId && <GalleryLightbox photos={filteredPhotos} index={Math.max(0, filteredPhotos.findIndex(photo => photo.id === selectedId))} onIndexChange={index => setSelectedId(filteredPhotos[index]?.id || null)} onClose={() => setSelectedId(null)} />}
      {selectionMode && <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-xl border border-neutral-700 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur"><div><b>{selected.size} selecionada(s)</b><p className="text-xs text-neutral-400">Carrinho atual: {items.length}</p></div><button type="button" disabled={!selected.size} onClick={addSelected} className="rounded-lg bg-red-600 px-5 py-3 font-bold disabled:opacity-50">Adicionar todas</button></div>}
    </div>
  );
}
