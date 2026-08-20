import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";

export default async function AdminPage() {

  const { count: events } =
    await supabaseAdmin
      .from("events")
      .select("*", {
        count:"exact",
        head:true
      });


  const { count: photos } =
    await supabaseAdmin
      .from("photos")
      .select("*", {
        count:"exact",
        head:true
      });


  const { count: available } =
    await supabaseAdmin
      .from("photos")
      .select("*", {
        count:"exact",
        head:true
      })
      .eq(
        "status",
        "available"
      );


  const { count: sold } =
    await supabaseAdmin
      .from("photos")
      .select("*", {
        count:"exact",
        head:true
      })
      .eq(
        "status",
        "sold"
      );

  const { data: paidOrders } = await supabaseAdmin.from("orders").select("total").eq("status", "paid");
  const revenue = paidOrders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;



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


        <h1 className="
          text-4xl
          font-bold
          mb-10
        ">
          Painel Administrativo
        </h1>



        <div className="
          grid
          md:grid-cols-4
          gap-6
        ">


          <Card
            title="Eventos"
            value={events || 0}
          />

          <Card
            title="Fotos"
            value={photos || 0}
          />

          <Card
            title="Disponíveis"
            value={available || 0}
          />

          <Card title="Vendidas" value={sold || 0} />


        </div>


        <div className="
          mt-12
          bg-neutral-900
          rounded-xl
          p-6
        ">

          <h2 className="
            text-xl
            font-bold
            mb-4
          ">
            Ações rápidas
          </h2>


          <div className="flex gap-4">

            <a
              href="/admin/events"
              className="
                bg-red-600
                px-5
                py-3
                rounded-lg
                font-bold
              "
            >
              Gerenciar eventos
            </a>

            <Link href="/admin/orders" className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Pedidos</Link>


            <a
              href="/admin/upload"
              className="
                bg-neutral-700
                px-5
                py-3
                rounded-lg
                font-bold
              "
            >
              Upload fotos
            </a>


          </div>


        </div>

        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6"><p className="text-neutral-400">Faturamento confirmado</p><p className="mt-2 text-3xl font-bold">{revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>



      </div>


    </main>

  );
}




function Card({
  title,
  value
}:{
  title:string;
  value:number;
}){

  return (

    <div className="
      bg-neutral-900
      border
      border-neutral-800
      rounded-xl
      p-6
    ">

      <p className="
        text-neutral-400
        mb-2
      ">
        {title}
      </p>


      <p className="
        text-4xl
        font-bold
      ">
        {value}
      </p>


    </div>

  );

}
