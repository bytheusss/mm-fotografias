import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; busca?: string }> }) {

  const filters = await searchParams;

  let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
  if (filters.status && ["paid", "pending", "cancelled"].includes(filters.status)) query = query.eq("status", filters.status);
  if (filters.busca?.trim()) query = query.or(`email.ilike.%${filters.busca.trim()}%,name.ilike.%${filters.busca.trim()}%`);

  const { data: orders, error } =
    await query;

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

        <form className="mb-8 flex flex-wrap gap-3">
          <input name="busca" defaultValue={filters.busca} placeholder="Nome ou e-mail" className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3" />
          <select name="status" defaultValue={filters.status || ""} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3"><option value="">Todos</option><option value="paid">Pagos</option><option value="pending">Pendentes</option><option value="cancelled">Cancelados</option></select>
          <button className="rounded-lg bg-red-600 px-5 py-3 font-bold">Filtrar</button>
          <a href={`/api/admin/reports/orders.csv${filters.status ? `?status=${filters.status}` : ""}`} className="rounded-lg bg-neutral-700 px-5 py-3 font-bold">Exportar CSV</a>
        </form>

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
