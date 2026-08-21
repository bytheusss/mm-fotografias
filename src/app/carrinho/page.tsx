"use client";

import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { SafeImage } from "@/components/ui/SafeImage";
import { calculatePrice } from "@/lib/pricing";


export default function CartPage() {

  const {
    items,
    removeFromCart,
  } = useCart();



  const { pricePerPhoto, subtotal, total: finalTotal, economy, label } = calculatePrice(items.length);
  const hasDiscount = Boolean(label);



  return (

    <main className="min-h-screen bg-black text-white pt-32">

      <Container>


        <h1 className="mb-10 text-4xl font-bold">
          Seu Carrinho
        </h1>



        {items.length === 0 ? (

          <div
            className="
              rounded-lg
              border
              border-neutral-800
              p-10
              text-center
            "
          >

            <p className="mb-6 text-neutral-400">
              Seu carrinho está vazio.
            </p>


            <Button href="/eventos/aacrc-05072026">
              Ver fotos
            </Button>


          </div>


        ) : (


          <div
            className="
              grid
              gap-8
              lg:grid-cols-[1fr_380px]
            "
          >


            {/* LISTA */}

            <div className="space-y-5">


              {items.map((photo) => (

                <div
                  key={photo.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-5
                    rounded-lg
                    border
                    border-neutral-800
                    bg-neutral-900
                    p-4
                  "
                >


                  <div className="flex items-center gap-5">


                    <div
                      className="
                        relative
                        h-24
                        w-24
                        overflow-hidden
                        rounded-lg
                        bg-black
                      "
                    >

                      <SafeImage
                        src={photo.imagem}
                        alt={`Foto ${photo.numero}`}
                        fill
                        className="object-cover"
                      />

                    </div>



                    <div>

                      <h2 className="text-lg font-bold">
                        Foto #{photo.numero}
                      </h2>


                      <p className="text-sm text-neutral-400">
                        Encontro AACRC
                      </p>



                      <Link
                        href={`/eventos/${photo.slug}/${photo.numero}`}
                        className="
                          mt-2
                          inline-block
                          text-sm
                          text-neutral-300
                          hover:text-white
                        "
                      >
                        Ver foto
                      </Link>


                    </div>


                  </div>





                  <div className="text-right">


                    <strong className="block text-lg">
                      R$ {pricePerPhoto},00
                    </strong>


                    <button
                      onClick={() =>
                        removeFromCart(photo.id)
                      }
                      className="
                        mt-3
                        text-sm
                        text-red-500
                        hover:text-red-400
                      "
                    >
                      Remover
                    </button>


                  </div>



                </div>


              ))}


            </div>






            {/* RESUMO */}

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


              <h2 className="text-2xl font-bold">
                Resumo
              </h2>




              <div className="mt-6 flex justify-between text-neutral-400">

                <span>
                  Fotos
                </span>

                <span>
                  {items.length}
                </span>

              </div>





              <div className="mt-4 flex justify-between">


                <span>
                  Subtotal
                </span>


                <span
                  className={
                    hasDiscount
                      ? "text-neutral-500 line-through"
                      : "font-bold"
                  }
                >
                  R$ {subtotal},00
                </span>


              </div>






              {hasDiscount && (

                <>

                  <div
                    className="
                      mt-5
                      rounded-lg
                      border
                      border-red-600/40
                      bg-red-600/10
                      p-4
                      text-sm
                      text-red-400
                    "
                  >

                    🔥 {label}

                  </div>



                  <div className="mt-4 flex justify-between text-green-400">

                    <span>
                      Economia
                    </span>


                    <span>
                      -R$ {economy},00
                    </span>


                  </div>

                </>

              )}







              <div
                className="
                  mt-6
                  border-t
                  border-neutral-800
                  pt-6
                  flex
                  justify-between
                  text-xl
                  font-bold
                "
              >

                <span>
                  Total
                </span>


                <span>
                  R$ {finalTotal},00
                </span>


              </div>







              <Button
  href="/checkout"
  className="
    mt-6
    w-full
    bg-red-600
    hover:bg-red-700
  "
  size="lg"
>
  Continuar para pagamento
</Button>






              <Button
                href="/eventos/aacrc-05072026"
                variant="outline"
                className="
                  mt-3
                  w-full
                "
              >

                Continuar vendo fotos

              </Button>



            </aside>



          </div>


        )}


      </Container>


    </main>

  );

}
