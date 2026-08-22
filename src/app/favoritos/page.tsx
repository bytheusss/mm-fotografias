"use client";

import { useCart } from "@/context/CartContext";
import { PhotoCard } from "@/components/ui/PhotoCard";

export default function FavoritesPage() {
  const { favorites, items, addToCart } = useCart();
  const missing = favorites.filter(photo => !items.some(item => item.id === photo.id));
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-4xl font-bold">Favoritos</h1><p className="mt-2 text-neutral-400">Compare suas escolhas e compre todas de uma vez.</p></div>{favorites.length>0&&<button type="button" disabled={!missing.length} onClick={()=>missing.forEach(addToCart)} className="rounded-lg bg-red-600 px-5 py-3 font-bold disabled:bg-neutral-700">{missing.length?`Adicionar ${missing.length} ao carrinho`:"Todas no carrinho ✓"}</button>}</div>
    {!favorites.length ? <p className="mt-8 text-neutral-400">Você ainda não favoritou nenhuma foto.</p> : <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{favorites.map(photo => <PhotoCard key={photo.id} photo={photo} />)}</div>}
  </div></main>;
}
