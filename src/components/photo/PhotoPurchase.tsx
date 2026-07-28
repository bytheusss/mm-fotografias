"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import type { EventPhoto } from "@/types";


interface Props {
  photo: EventPhoto;
}



export function PhotoPurchase({
  photo,
}: Props) {


  const {
    addToCart,
    items,
  } = useCart();



  const alreadyAdded =
    items.some(
      item => item.id === photo.id
    );



  return (

    <>

      <div
        className="
          mt-8
          rounded-lg
          bg-black
          p-5
        "
      >

        <span className="text-sm text-neutral-400">
          Valor da foto
        </span>

        <strong
          className="
            mt-1
            block
            text-4xl
            font-bold
          "
        >
          R$ 15,00
        </strong>

      </div>




      <Button
        className="mt-6 w-full"
        size="lg"
        disabled={alreadyAdded}
        onClick={() =>
          addToCart(photo)
        }
      >

        {alreadyAdded
          ? "Já está no carrinho"
          : "Adicionar ao carrinho"
        }

      </Button>




      <Button
        href="/carrinho"
        variant="outline"
        className="mt-3 w-full"
      >

        Ver carrinho

      </Button>


    </>

  );

}