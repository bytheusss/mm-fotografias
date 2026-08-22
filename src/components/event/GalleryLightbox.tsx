"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { analyticsAllowed } from "@/lib/privacy-consent";
import type { EventPhoto } from "@/types";

export function GalleryLightbox({ photos, index, onIndexChange, onClose }: { photos: EventPhoto[]; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const photo = photos[index]; const { addToCart, items, favorites, toggleFavorite } = useCart();
  const added = photo ? items.some(item => item.id === photo.id) : false; const favorite = photo ? favorites.some(item => item.id === photo.id) : false;
  const previous = () => onIndexChange((index - 1 + photos.length) % photos.length); const next = () => onIndexChange((index + 1) % photos.length);
  useEffect(() => { const overflow = document.body.style.overflow; document.body.style.overflow = "hidden"; const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if (event.key === "ArrowLeft") previous(); if (event.key === "ArrowRight") next(); }; window.addEventListener("keydown", keydown); return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", keydown); }; });
  useEffect(() => { if (!photo) return; localStorage.setItem(`mm-last-photo-${photo.slug}`, JSON.stringify({ id: photo.id, numero: photo.numero, at: Date.now() })); if (!photo.eventId || !analyticsAllowed()) return; const sessionKey = localStorage.getItem("mm-session") || crypto.randomUUID(); localStorage.setItem("mm-session", sessionKey); void fetch("/api/interactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photoId: photo.id, eventId: photo.eventId, kind: "view", sessionKey }) }); }, [photo]);
  if (!photo) return null;
  return <div className="fixed inset-0 z-[100] flex bg-black/95" role="dialog" aria-modal="true" aria-label={`Visualização da foto ${photo.numero}`} onClick={onClose}>
    <button type="button" onClick={onClose} className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-2xl text-white hover:bg-red-700" aria-label="Fechar visualização">×</button>
    <button type="button" onClick={event => { event.stopPropagation(); previous(); }} className="absolute left-3 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-3xl text-white hover:bg-red-700 md:left-6" aria-label="Foto anterior">‹</button>
    <button type="button" onClick={event => { event.stopPropagation(); next(); }} className="absolute right-3 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-3xl text-white hover:bg-red-700 md:right-[330px]" aria-label="Próxima foto">›</button>
    <div className="grid h-full w-full grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[1fr_310px] md:grid-rows-1" onClick={event => event.stopPropagation()}>
      <div className="group relative min-h-0 overflow-hidden" onContextMenu={event => event.preventDefault()}>
        <Image key={photo.id} src={photo.imagem} alt={`Foto ${photo.numero} — ${photo.evento}`} fill priority draggable={false} sizes="(max-width: 768px) 100vw, calc(100vw - 310px)" className="select-none object-contain" />
        <div className="absolute inset-0 z-10 select-none" aria-hidden="true" />
        <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-sm text-white">{index + 1} / {photos.length}</div>
      </div>
      <aside className="relative z-20 flex flex-col border-t border-neutral-800 bg-neutral-950 p-5 text-white md:border-l md:border-t-0 md:p-6">
        <p className="text-sm uppercase tracking-wide text-red-500">{photo.evento}</p><h2 className="mt-2 text-3xl font-bold">Foto #{photo.numero}</h2><p className="mt-3 text-2xl font-black">{photo.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <div className="mt-auto grid gap-3 pt-5"><button type="button" onClick={() => { toggleFavorite(photo); if (photo.eventId && analyticsAllowed()) void fetch("/api/interactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photoId: photo.id, eventId: photo.eventId, kind: "favorite", sessionKey: localStorage.getItem("mm-session") }) }); }} className="rounded-lg border border-neutral-700 px-4 py-3 font-bold hover:bg-neutral-800">{favorite ? "♥ Remover dos favoritos" : "♡ Adicionar aos favoritos"}</button><button type="button" onClick={() => { addToCart(photo); if (photo.eventId && analyticsAllowed()) void fetch("/api/interactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photoId: photo.id, eventId: photo.eventId, kind: "cart", sessionKey: localStorage.getItem("mm-session") }) }); }} disabled={added || photo.salesPaused} className="rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-400">{photo.salesPaused ? "Vendas pausadas" : added ? "Adicionada ao carrinho ✓" : "Adicionar ao carrinho"}</button><button type="button" onClick={() => { const url = `${location.origin}/eventos/${photo.slug}/${photo.numero}`; if (navigator.share) void navigator.share({ title: `Foto #${photo.numero} — ${photo.evento}`, url }); else void navigator.clipboard.writeText(url); }} className="rounded-lg bg-neutral-800 px-4 py-3 font-bold hover:bg-neutral-700">Compartilhar esta foto</button><a href="/carrinho" className="rounded-lg bg-neutral-800 px-4 py-3 text-center font-bold hover:bg-neutral-700">Ver carrinho ({items.length})</a></div>
      </aside>
    </div>
  </div>;
}
