"use client";

import { useMemo, useState } from "react";
import { PhotoCard } from "@/components/ui/PhotoCard";
import type { EventPhoto } from "@/types";

interface PhotoSearchProps {
  photos: EventPhoto[];
}

export function PhotoSearch({ photos }: PhotoSearchProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
