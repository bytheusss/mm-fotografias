"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MinhaContaPage() {

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function load() {

      const { data } =
        await supabase.auth.getUser();


      if (!data.user) {

        window.location.href="/login";
        return;

      }


      setUser(data.user);


      const res =
        await fetch(
          `/api/orders/my?email=${data.user.email}`
        );


      const json =
        await res.json();


      setOrders(json.orders || []);

      setLoading(false);

    }


    load();

  }, []);



  async function logout(){

    await supabase.auth.signOut();

    window.location.href="/login";

  }



  function getPhotos(order:any){

    try {

      return typeof order.photos === "string"
        ? JSON.parse(order.photos).length
        : order.photos?.length || 0;

    } catch {

      return 0;

    }

  }



  if(loading){

    return (

      <main className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
      ">

        Carregando...

      </main>

    );

  }



  return (

    <main className="
    min-h-screen
    bg-black
    text-white
    pt-32
    pb-20
    ">


      <div className="
      max-w-6xl
      mx-auto
      px-6
      ">



        <header className="
        flex
        justify-between
        items-start
        mb-10
        gap-5
        ">


          <div>

            <h1 className="
            text-4xl
            font-bold
            ">
              Minha Conta
            </h1>


            <p className="
            text-neutral-400
            mt-2
            ">
              Gerencie suas compras e fotografias
            </p>


          </div>



          <button
          onClick={logout}
          className="
          bg-red-600
          hover:bg-red-700
          px-6
          py-3
          rounded-lg
          font-bold
          ">

            Sair

          </button>


        </header>





        <section className="
        bg-neutral-900
        border
        border-neutral-800
        rounded-2xl
        p-8
        mb-10
        ">


          <div className="
          flex
          justify-between
          items-center
          gap-5
          ">


            <div>


              <h2 className="
              text-2xl
              font-bold
              mb-5
              ">
                Perfil
              </h2>


              <p className="text-lg">

                👤{" "}
                <strong>
                  {
                    user.user_metadata?.name ||
                    "Cliente"
                  }
                </strong>

              </p>


              <p className="
              text-neutral-400
              mt-2
              ">

                ✉️ {user.email}

              </p>


            </div>



            <button
            className="
            border
            border-neutral-700
            hover:bg-neutral-800
            px-5
            py-3
            rounded-lg
            font-bold
            ">

              Editar perfil

            </button>


          </div>


        </section>





        <section>


          <div className="
          flex
          justify-between
          items-center
          mb-6
          ">


            <h2 className="
            text-3xl
            font-bold
            ">
              Meus pedidos
            </h2>


            <span className="
            text-neutral-400
            ">
              {orders.length} pedido(s)
            </span>


          </div>





          {
            orders.length === 0 && (

              <div className="
              bg-neutral-900
              border
              border-neutral-800
              rounded-xl
              p-8
              text-neutral-400
              ">

                Você ainda não possui pedidos.

              </div>

            )
          }






          <div className="grid gap-6">


          {
            orders.map((order:any)=>(


              <article
              key={order.id}
              className="
              bg-neutral-900
              border
              border-neutral-800
              rounded-2xl
              p-7
              ">



                <div className="
                flex
                justify-between
                items-center
                gap-5
                ">



                  <div>


                    <h3 className="
                    text-2xl
                    font-bold
                    ">

                      Pedido #{order.id.slice(0,8)}

                    </h3>



                    <div className="
                    text-neutral-400
                    mt-3
                    space-y-1
                    ">


                      <p>
                        📸 {getPhotos(order)} foto(s)
                      </p>


                      <p>
                        💰 R$ {Number(order.total).toFixed(2)}
                      </p>


                      <p>
                        📅{" "}
                        {
                          new Date(
                            order.created_at
                          ).toLocaleDateString("pt-BR")
                        }
                      </p>


                    </div>



                    <span
                    className={`
                    inline-block
                    mt-4
                    px-4
                    py-2
                    rounded-full
                    font-bold

                    ${
                      order.status==="paid"
                      ?
                      "bg-green-600"
                      :
                      order.status==="pending"
                      ?
                      "bg-yellow-600"
                      :
                      "bg-red-600"
                    }
                    `}>


                      {
                        order.status==="paid"
                        ?
                        "Pagamento aprovado"
                        :
                        order.status==="pending"
                        ?
                        "Pagamento pendente"
                        :
                        "Cancelado"
                      }


                    </span>


                  </div>






                  <div className="
                  flex
                  flex-col
                  gap-3
                  ">


                    <button
                    className="
                    bg-neutral-700
                    hover:bg-neutral-600
                    px-6
                    py-3
                    rounded-lg
                    font-bold
                    ">

                      Ver pedido

                    </button>





                    {
                      order.status==="paid" &&
                      order.download_token && (

                        <a
                        href={`/download/${order.download_token}`}
                        className="
                        bg-green-600
                        hover:bg-green-700
                        px-6
                        py-3
                        rounded-lg
                        font-bold
                        text-center
                        ">

                          Baixar fotos

                        </a>

                      )
                    }


                  </div>



                </div>


              </article>


            ))
          }


          </div>


        </section>



      </div>


    </main>

  );

}