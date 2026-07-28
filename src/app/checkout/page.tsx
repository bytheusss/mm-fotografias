"use client";

import { useState } from "react";

import { useCart } from "@/context/CartContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";


export default function CheckoutPage() {


  const { items } = useCart();


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [whatsapp, setWhatsapp] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [pix, setPix] =
    useState<any>(null);



  const hasDiscount =
    items.length >= 5;


  const pricePerPhoto =
    hasDiscount ? 12 : 15;


  const subtotal =
    items.length * 15;


  const total =
    items.length * pricePerPhoto;


  const economy =
    subtotal - total;



  async function gerarPix() {

    try {

      setLoading(true);


      const response =
        await fetch(
          "/api/payment/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },


            body: JSON.stringify({

              name,

              email,

              whatsapp,

              items,

              total,

            }),

          }
        );



      const data =
        await response.json();



      console.log(
        "PIX DATA JSON:",
        JSON.stringify(
          data,
          null,
          2
        )
      );



      if(data.error){

        alert(data.error);

        return;

      }



      setPix(data);



    } catch(error) {


      console.error(error);


      alert(
        "Erro ao gerar PIX"
      );


    } finally {

      setLoading(false);

    }


  }





  const payment =
    pix?.payment
      ?.payment_method;



  const qrCode =
    payment?.qr_code;



  const qrBase64 =
    payment?.qr_code_base64;



  const ticketUrl =
    payment?.ticket_url;





  async function copiarPix(){

    if(!qrCode)
      return;


    await navigator.clipboard.writeText(
      qrCode
    );


    alert(
      "Código PIX copiado!"
    );

  }





  return (

    <main className="min-h-screen bg-black text-white pt-32 pb-20">


      <Container>


        <h1 className="mb-10 text-4xl font-bold">
          Checkout
        </h1>



        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">



          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">


            <h2 className="mb-6 text-2xl font-bold">
              Seus dados
            </h2>



            <div className="space-y-5">



              <input

                type="text"

                placeholder="Nome completo"

                value={name}

                onChange={(e)=>
                  setName(e.target.value)
                }

                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-red-600"

              />



              <input

                type="email"

                placeholder="E-mail"

                value={email}

                onChange={(e)=>
                  setEmail(e.target.value)
                }

                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-red-600"

              />



              <input

                type="tel"

                placeholder="WhatsApp"

                value={whatsapp}

                onChange={(e)=>
                  setWhatsapp(e.target.value)
                }

                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-red-600"

              />



            </div>


          </section>





          <aside className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">


            <h2 className="mb-6 text-2xl font-bold">
              Resumo do pedido
            </h2>



            {items.map((photo)=>(


              <div
                key={photo.id}
                className="flex items-center gap-3 mb-4"
              >


                <div className="relative h-16 w-16 overflow-hidden rounded">


                  <SafeImage

                    src={photo.imagem}

                    alt={`Foto ${photo.numero}`}

                    fill

                    className="object-cover"

                  />


                </div>



                <div>


                  <p className="font-semibold">

                    Foto #{photo.numero}

                  </p>


                  <span className="text-sm text-neutral-400">

                    R$ {pricePerPhoto},00

                  </span>


                </div>


              </div>


            ))}

<div className="border-t border-neutral-800 my-6" />



<div className="flex justify-between">

  <span>
    Subtotal
  </span>


  <span className={
    hasDiscount
      ? "line-through text-neutral-500"
      : ""
  }>

    R$ {subtotal},00

  </span>


</div>





{hasDiscount && (

  <>

    <div className="mt-4 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">

      🔥 Pacote 5+ fotos aplicado

      <br />

      R$12,00 por foto

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







<div className="mt-6 border-t border-neutral-800 pt-6 flex justify-between text-2xl font-bold">


  <span>
    Total
  </span>


  <span>
    R$ {total},00
  </span>


</div>







{!pix ? (

  <Button

    onClick={gerarPix}

    disabled={loading}

    className="mt-8 w-full bg-red-600 hover:bg-red-700"

  >

    {loading

      ? "Gerando PIX..."

      : "Gerar PIX"

    }


  </Button>


) : (


  <div className="mt-8 rounded-xl bg-black p-5">


    <h3 className="mb-4 font-bold text-xl">

      PIX Gerado

    </h3>




    {qrBase64 ? (

      <img

        src={
          `data:image/png;base64,${qrBase64}`
        }

        alt="QR Code PIX"

        className="mx-auto w-64 rounded-lg bg-white p-2"

      />

    ) : (

      <p className="text-red-400">

        QR Code não retornado

      </p>

    )}






    {qrCode && (

      <>


        <textarea

          readOnly

          value={qrCode}

          className="mt-5 h-28 w-full rounded-lg bg-neutral-900 p-3 text-xs"

        />



        <Button

          onClick={copiarPix}

          className="mt-3 w-full bg-green-600 hover:bg-green-700"

        >

          Copiar código PIX

        </Button>


      </>

    )}







    {ticketUrl && (

      <a

        href={ticketUrl}

        target="_blank"

        className="mt-3 block w-full rounded-lg bg-red-600 px-4 py-3 text-center font-bold hover:bg-red-700"

      >

        Abrir pagamento Mercado Pago

      </a>

    )}



  </div>


)}



</aside>



</div>



</Container>


</main>


);

}