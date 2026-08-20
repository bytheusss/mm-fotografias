import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function OrdersPage() {

  const { data: orders, error } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-20">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              Pedidos
            </h1>

            <p className="text-neutral-400 mt-2">
              Todos os pedidos realizados
            </p>

          </div>

        </div>

        <div className="grid gap-5">

          {orders?.map((order: any) => {

            const photos =
              typeof order.photos === "string"
                ? JSON.parse(order.photos)
                : order.photos || [];

            return (

              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex justify-between items-center"
              >

                <div>

                  <h2 className="text-2xl font-bold">
                    {order.name}
                  </h2>

                  <p className="text-neutral-400">
                    {order.email}
                  </p>

                  <p className="text-neutral-400">
                    {order.whatsapp}
                  </p>

                  <div className="flex gap-6 mt-3 text-sm">

                    <span>
                      📸 {photos.length} foto(s)
                    </span>

                    <span>
                      💰 R$ {Number(order.total).toFixed(2)}
                    </span>

                    <span>

                      {order.status === "paid" && "🟢 Pago"}
                      {order.status === "pending" && "🟡 Pendente"}
                      {order.status === "cancelled" && "🔴 Cancelado"}

                    </span>

                  </div>

                </div>

                <a
                  href={`/admin/orders/${order.id}`}
                  className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-lg font-bold"
                >
                  Gerenciar
                </a>

              </div>

            );

          })}

        </div>

      </div>

    </main>
  );
}