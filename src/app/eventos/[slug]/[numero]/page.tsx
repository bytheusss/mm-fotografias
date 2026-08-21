import { notFound } from "next/navigation";

import { getEventPhoto } from "@/lib/events";

import { Container } from "@/components/ui/Container";
import { SafeImage } from "@/components/ui/SafeImage";
import { AddToCartButton } from "@/components/event/AddToCartButton";
import { PhotoWatermark } from "@/components/ui/PhotoWatermark";


interface Props {
  params: Promise<{
    slug: string;
    numero: string;
  }>;
}


export default async function FotoPage({
  params,
}: Props) {

  const { slug, numero } = await params;


  const photo = await getEventPhoto(
    slug,
    numero
  );


  if (!photo) {
    notFound();
  }


  return (
    <main className="min-h-screen bg-black text-white">

      <Container>

        <section className="pt-32 pb-10">


          {/* Voltar */}
          <a
            href={`/eventos/${slug}`}
            className="
              mb-8
              inline-flex
              text-sm
              text-neutral-400
              transition
              hover:text-white
            "
          >
            ← Voltar para galeria
          </a>



          <div
            className="
              grid
              gap-10
              lg:grid-cols-[1fr_350px]
            "
          >


            {/* FOTO */}
            <div
              className="
                relative
                aspect-square
                overflow-hidden
                rounded-xl
                border
                border-neutral-800
                bg-neutral-900
              "
            >

              <SafeImage
                src={photo.imagem}
                alt={`Foto ${photo.numero}`}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
              <PhotoWatermark />

            </div>




            {/* COMPRA */}
            <aside
              className="
                rounded-xl
                border
                border-neutral-800
                bg-neutral-900
                p-6
              "
            >


              <span
                className="
                  inline-block
                  rounded
                  bg-red-600
                  px-3
                  py-1
                  text-sm
                  font-bold
                "
              >
                FOTO #{photo.numero}
              </span>



              <h1
                className="
                  mt-5
                  text-3xl
                  font-bold
                "
              >
                Sua foto em alta resolução
              </h1>



              <p className="mt-3 text-neutral-400">
                Baixe sua lembrança do evento com qualidade profissional.
              </p>




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




              <AddToCartButton photo={photo} />



            </aside>


          </div>


        </section>


      </Container>


    </main>
  );
}
