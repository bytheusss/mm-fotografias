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
  const [{ count: unattributed }, { count: pendingOrders }, { count: openPrivacy }, { count: eventsWithoutCover }] = await Promise.all([
    supabaseAdmin.from("photos").select("*", { count: "exact", head: true }).is("photographer_id", null).is("deleted_at", null),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("data_subject_requests").select("*", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    supabaseAdmin.from("events").select("*", { count: "exact", head: true }).is("cover_image", null).eq("archived", false),
  ]);



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


          <div className="flex flex-wrap gap-3">

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

            <Link href="/admin/coupons" className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Cupons</Link>
            <Link href="/admin/pricing" className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Pacotes</Link>
            <Link href="/admin/finance" className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Financeiro</Link>
            <Link href="/admin/abandoned-carts" className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Carrinhos</Link>
            <Link href="/admin/integrations" className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Integrações</Link>


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

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6"><h2 className="mb-4 text-xl font-bold">Central operacional</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Operational href="/admin/events" label="Eventos sem capa" value={eventsWithoutCover || 0}/><Operational href="/admin/events" label="Fotos sem fotógrafo" value={unattributed || 0}/><Operational href="/admin/orders?status=pending" label="Pedidos pendentes" value={pendingOrders || 0}/><Operational href="/admin/privacy" label="Solicitações LGPD" value={openPrivacy || 0}/></div></section>



      </div>


    </main>

  );
}

function Operational({ href, label, value }: { href: string; label: string; value: number }) { return <Link href={href} className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${value ? "border-amber-800 bg-amber-950/30" : "border-neutral-800 bg-black/40"}`}><span className="text-sm text-neutral-400">{label}</span><b className="mt-2 block text-2xl">{value}</b><small className="text-neutral-500">{value ? "Requer atenção →" : "Tudo certo"}</small></Link>; }




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
