import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";

export default async function OrderPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const { id } = await params;

  const { data: order, error } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !order) {
    notFound();
  }

  const photos =
    typeof order.photos === "string"
      ? JSON.parse(order.photos)
      : order.photos || [];

  return (

    <main className="min-h-screen bg-black text-white pt-32 pb-20">

      <div className="max-w-6xl mx-auto px-6">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              Pedido
            </h1>

            <p className="text-neutral-400 mt-2">
              {order.id}
            </p>

          </div>

          <a
            href="/admin/orders"
            className="bg-neutral-700 hover:bg-neutral-600 px-5 py-3 rounded-lg font-bold"
          >
            ← Voltar
          </a>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">

            <h2 className="text-xl font-bold mb-5">
              Cliente
            </h2>

            <div className="space-y-3">

              <p>
                <strong>Nome:</strong> {order.name}
              </p>

              <p>
                <strong>Email:</strong> {order.email}
              </p>

              <p>
                <strong>WhatsApp:</strong> {order.whatsapp}
              </p>

            </div>

          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">

            <h2 className="text-xl font-bold mb-5">
              Pedido
            </h2>

            <div className="space-y-3">

              <p>
                <strong>Total:</strong> R$ {Number(order.total).toFixed(2)}
              </p>

              <p>

                <strong>Status:</strong>{" "}

                {order.status === "paid" && "🟢 Pago"}
                {order.status === "pending" && "🟡 Pendente"}
                {order.status === "cancelled" && "🔴 Cancelado"}

              </p>

              <p>

                <strong>Data:</strong>{" "}

                {new Date(order.created_at).toLocaleString("pt-BR")}

              </p>

              <p>

                <strong>Download Token:</strong>

              </p>

              <div className="bg-black rounded p-3 break-all text-sm">

                {order.download_token || "Ainda não gerado"}

              </div>

              <OrderActions
                orderId={order.id}
                status={order.status}
                downloadToken={order.download_token}
                revoked={Boolean(order.download_revoked_at)}
                adminNotes={order.admin_notes}
                refundStatus={order.refund_status}
              />

            </div>

          </div>

        </div>

        <h2 className="text-2xl font-bold mb-6">

          Fotos Compradas

        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {photos.map((photo: any) => (

<div
  key={photo.id}
  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
>

  <img
    src={photo.thumbnail}
    alt={photo.numero}
    className="aspect-square object-cover w-full"
  />

  <div className="p-3">

    <p className="font-bold">
      #{photo.numero}
    </p>

    <p className="text-neutral-400 text-sm">
      R$ {photo.preco}
    </p>

    <a
      href={photo.imagem}
      target="_blank"
      className="block mt-3 text-center bg-red-600 hover:bg-red-700 rounded py-2 font-bold text-sm"
    >
      Abrir
    </a>

  </div>

</div>

))}

</div>

</div>

</main>

);

}
