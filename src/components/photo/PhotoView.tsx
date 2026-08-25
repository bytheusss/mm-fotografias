"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import Image from "next/image";
import Link from "next/link";
import {useEffect} from "react";

import type { EventPhoto } from "@/types";


interface Props {
  photo: EventPhoto;
}



export function PhotoView({
  photo,
}: Props) {


  const {
    addToCart,
    items,
    recordViewed,
  } = useCart();

  useEffect(()=>recordViewed(photo),[photo,recordViewed]);



  const alreadyAdded =
    items.some(
      item => item.id === photo.id
    );



  return (

    <main className="min-h-screen bg-black text-white pt-32">


      <Container>


        <Link
          href={`/eventos/${photo.slug}`}
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Voltar para galeria
        </Link>




        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_350px]">


          <div className="
            relative
            aspect-[4/3]
            overflow-hidden
            rounded-lg
            bg-neutral-900
          " onContextMenu={event => event.preventDefault()}>


            <Image
              src={photo.imagem}
              alt={`Foto ${photo.numero}`}
              fill
              className="object-contain"
              priority
              draggable={false}
            />

            <div className="absolute inset-0 z-10 select-none" aria-hidden="true" />


          </div>





          <aside
            className="
            h-fit
            rounded-lg
            border
            border-neutral-800
            bg-neutral-900
            p-6
            "
          >


            <h1 className="text-3xl font-bold">
              Foto #{photo.numero}
            </h1>



            <p className="mt-2 text-neutral-400">
              {photo.evento}
            </p>




            <div className="my-6 border-t border-neutral-800" />




            <span className="text-3xl font-bold">
              {photo.preco.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
            </span>





            <Button

              className="mt-6 w-full"

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



          </aside>



        </div>


      </Container>


    </main>

  );

}
