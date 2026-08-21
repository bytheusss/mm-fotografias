"use client";

import { useCart } from "@/context/CartContext";
import { PhotoCard } from "@/components/ui/PhotoCard";

export default function FavoritesPage() {
  const { favorites } = useCart();
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl">
    <h1 className="text-4xl font-bold">Favoritos</h1>
    {!favorites.length ? <p className="mt-8 text-neutral-400">Você ainda não favoritou nenhuma foto.</p> : <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{favorites.map(photo => <PhotoCard key={photo.id} photo={photo} />)}</div>}
  </div></main>;
}
