"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/context/CartContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { createClient } from "@/lib/supabase/client";


export default function CheckoutPage() {


  const { items, pricing } = useCart();


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

  const [errorMessage, setErrorMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [recoveryOptIn, setRecoveryOptIn] = useState(false);

  useEffect(() => {
    async function prefill() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name,phone").eq("id", data.user.id).maybeSingle();
      setName(profile?.full_name || data.user.user_metadata?.name || "");
      setWhatsapp(profile?.phone || data.user.user_metadata?.whatsapp || "");
      setEmail(data.user.email || "");
    }
    prefill();
  }, []);

  useEffect(() => {
    if (!recoveryOptIn || !items.length || !/^\S+@\S+\.\S+$/.test(email)) return;
    const timer = window.setTimeout(() => { fetch("/api/cart-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, whatsapp, items }) }).catch(() => undefined); }, 2000);
    return () => window.clearTimeout(timer);
  }, [email, items, name, recoveryOptIn, whatsapp]);



  const { pricePerPhoto, subtotal, total, economy, label } = pricing;
  const hasDiscount = Boolean(label);
  const finalTotal = Math.max(0, total - couponDiscount);

  async function validateCoupon() {
    setCouponMessage("");
    const response = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode, quantity: items.length, eventSlugs: items.map(item => item.slug) }) });
    const data = await response.json();
    if (!response.ok) { setCouponDiscount(0); setCouponMessage(data.error || "Cupom inválido"); return; }
    setCouponDiscount(Number(data.discount || 0));
    setCouponCode(String(data.code || couponCode).toUpperCase());
    setCouponMessage(`Cupom aplicado: -R$ ${Number(data.discount || 0).toFixed(2).replace(".", ",")}`);
  }



  async function gerarPix() {

    try {

      setErrorMessage("");
      if (!items.length) { setErrorMessage("Seu carrinho está vazio."); return; }
      if (!name.trim() || !email.trim()) { setErrorMessage("Preencha nome e e-mail."); return; }
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

              total: finalTotal,

              couponCode,

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

        setErrorMessage(data.error);

        return;

      }



      setPix({

        ...data,


        qr_code:
          data.qr_code ||
          data.payment
            ?.point_of_interaction
            ?.transaction_data
            ?.qr_code,


        qr_code_base64:
          data.qr_code_base64 ||
          data.payment
            ?.point_of_interaction
            ?.transaction_data
            ?.qr_code_base64,


        ticket_url:
          data.ticket_url ||
          data.payment
            ?.point_of_interaction
            ?.transaction_data
            ?.ticket_url,

      });



    } catch(error) {


      console.error(error);


      setErrorMessage("Erro ao gerar PIX. Tente novamente.");


    } finally {

      setLoading(false);

    }


  }

  async function abrirCheckoutCompleto() {
    setErrorMessage(""); if (!items.length || !name.trim() || !email.trim()) { setErrorMessage("Preencha nome, e-mail e itens do carrinho."); return; }
    setLoading(true); try { const response = await fetch("/api/payment/checkout-pro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, whatsapp, items, couponCode }) }); const data = await response.json().catch(() => ({})); if (!response.ok || !data.checkout_url) throw new Error(data.error || "Checkout indisponível."); window.location.assign(data.checkout_url); } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Erro ao abrir pagamento."); setLoading(false); }
  }



  const qrCode =
    pix?.qr_code;


  const qrBase64 =
    pix?.qr_code_base64;


  const ticketUrl =
    pix?.ticket_url;





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

              <label className="flex items-start gap-3 text-sm text-neutral-300"><input type="checkbox" checked={recoveryOptIn} onChange={e => setRecoveryOptIn(e.target.checked)} className="mt-1" /><span>Quero receber um lembrete por e-mail ou WhatsApp se eu não concluir esta compra.</span></label>



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

            <div className="mb-5 flex gap-2">
              <input value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponDiscount(0); }} placeholder="Cupom" className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-black px-3 py-2 uppercase" />
              <button type="button" onClick={validateCoupon} className="rounded-lg bg-neutral-700 px-4 py-2 font-bold">Aplicar</button>
            </div>
            {couponMessage && <p className={`mb-5 text-sm ${couponDiscount ? "text-green-400" : "text-red-400"}`}>{couponMessage}</p>}



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







            <div className="mt-6 border-t border-neutral-800 pt-6 flex justify-between text-2xl font-bold">


              <span>
                Total
              </span>


              <span>
                  R$ {finalTotal.toFixed(2).replace(".", ",")}
              </span>


            </div>







            {!pix ? (


              <>{errorMessage && <p role="alert" className="mb-4 rounded-lg bg-red-950 p-3 text-sm text-red-200">{errorMessage}</p>}<Button

                onClick={abrirCheckoutCompleto}

                disabled={loading}

                className="mt-8 w-full bg-red-600 hover:bg-red-700"

              >

                {loading ? "Abrindo pagamento…" : "Pagar com cartão ou Mercado Pago"}

              </Button><p className="mt-3 text-center text-xs text-neutral-500">Cartão de crédito, saldo Mercado Pago e demais opções habilitadas na sua conta.</p><Button

                onClick={gerarPix}

                disabled={loading}

                className="mt-3 w-full bg-neutral-700 hover:bg-neutral-600"

              >

                {loading

                  ? "Gerando PIX..."

                  : "Gerar PIX"

                }


              </Button></>



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
