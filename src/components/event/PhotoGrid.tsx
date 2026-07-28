"use client";

import { useEffect, useRef, useState } from "react";
import type { EventPhoto } from "@/types";
import { PhotoCard } from "@/components/ui/PhotoCard";

interface PhotoGridProps {
  photos: EventPhoto[];
}

const STEP = 24;

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [visible, setVisible] = useState(STEP);

  const triggerRef = useRef<HTMLDivElement | null>(null);

  // Sempre que a busca mudar, reseta a quantidade visível
  useEffect(() => {
    setVisible(STEP);
  }, [photos]);

  useEffect(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          visible < photos.length
        ) {
          setVisible((old) =>
            Math.min(old + STEP, photos.length)
          );
        }
      },
      {
        rootMargin: "500px",
      }
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [visible, photos.length]);

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
        {photos
          .slice(0, visible)
          .map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
            />
          ))}
      </div>

      {visible < photos.length && (
        <div
          ref={triggerRef}
          className="flex justify-center py-12"
        >
          <span className="text-sm text-zinc-400">
            Carregando mais fotos...
          </span>
        </div>
      )}
    </>
  );
}