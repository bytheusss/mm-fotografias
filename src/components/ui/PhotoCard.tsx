"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import type { EventPhoto } from "@/types";


interface PhotoCardProps {
  photo: EventPhoto;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onView?: () => void;
}



export function PhotoCard({
  photo,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 33vw",
  className = "aspect-square",
  onView,
}: PhotoCardProps) {


  const {
    addToCart,
    items,
    favorites,
    toggleFavorite,
  } = useCart();



  const alreadyAdded =
    items.some(
      item => item.id === photo.id
    );



  return (

    <div
      className={`group relative overflow-hidden rounded-sm ${className}`}
      onContextMenu={event => event.preventDefault()}
    >

      <button
        type="button"
        aria-label={favorites.some(item => item.id === photo.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        onClick={() => toggleFavorite(photo)}
        className="absolute right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-xl text-white hover:bg-red-600"
      >
        {favorites.some(item => item.id === photo.id) ? "♥" : "♡"}
      </button>

      <SafeImage
        src={photo.imagem}
        alt={`Foto ${photo.numero} — ${photo.evento}`}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes={sizes}
        draggable={false}
      />

      {onView && <button type="button" onClick={onView} className="absolute inset-0 z-10 cursor-zoom-in" aria-label={`Ampliar foto ${photo.numero}`} />}


      <div className="pointer-events-none absolute inset-0 z-20 bg-black/0 transition-colors duration-500 group-hover:bg-black/50" />



      <div
        className="
        absolute inset-x-0 bottom-0 z-30
        flex translate-y-full flex-col 
        items-center gap-2 p-4
        transition-transform duration-500
        group-hover:translate-y-0
        "
      >


        <span className="text-sm font-medium text-white">
          Foto #{photo.numero}
        </span>



        {onView ? <button type="button" onClick={onView} className="w-full rounded-sm bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200">Visualizar</button> : <Button href={`/eventos/${photo.slug}/${photo.numero}`} size="sm" variant="secondary" className="w-full">Visualizar</Button>}



        <button
          onClick={() => addToCart(photo)}
          disabled={alreadyAdded}
          className={`
            w-full rounded-sm px-4 py-2 text-sm font-semibold
            transition
            ${
              alreadyAdded
              ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700"
            }
          `}
        >

          {
            alreadyAdded
            ? "Adicionada ✓"
            : "Adicionar ao carrinho"
          }

        </button>


      </div>


    </div>

  );

}
