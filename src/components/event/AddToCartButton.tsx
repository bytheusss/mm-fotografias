"use client";

import { useCart } from "@/context/CartContext";
import type { EventPhoto } from "@/types";
import { Button } from "@/components/ui/Button";
import { useState } from "react";


interface Props {
  photo: EventPhoto;
}


export function AddToCartButton({
  photo,
}: Props) {

  const {
    addToCart,
    items,
  } = useCart();


  const [added, setAdded] = useState(
    items.some(
      item => item.id === photo.id
    )
  );


  function handleAdd() {

    addToCart(photo);

    setAdded(true);

  }



  return (

    <Button
      className="mt-6 w-full"
      size="lg"
      onClick={handleAdd}
      disabled={added}
    >

      {added
        ? "✓ Adicionada ao carrinho"
        : "Comprar foto"
      }

    </Button>

  );

}