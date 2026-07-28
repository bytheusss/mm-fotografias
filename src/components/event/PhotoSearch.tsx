"use client";

import { useMemo, useState } from "react";
import { PhotoCard } from "@/components/ui/PhotoCard";
import type { EventPhoto } from "@/types";

interface PhotoSearchProps {
  photos: EventPhoto[];
}

export function PhotoSearch({ photos }: PhotoSearchProps) {
  const [search, setSearch] = useState("");

  const filteredPhotos = useMemo(() => {
    const value = search.replace(/\D/g, "");

    if (!value) {
      return photos;
    }

    return photos.filter((photo) => {
      const number = String(photo.numero).padStart(4, "0");

      return number.includes(value.padStart(4, "0"));
    });
  }, [photos, search]);

  return (
    <div>
      <div className="mb-8">
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