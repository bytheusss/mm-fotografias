import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";

export default async function DownloadPage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;

  const { data: order, error } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("download_token", token)
      .single();

  if (error || !order) {
    notFound();
  }

  if (order.status !== "paid") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Pagamento pendente
          </h1>

          <p className="mt-3 text-neutral-400">
            Assim que o pagamento for aprovado,
            suas fotos serão liberadas.
          </p>
        </div>
      </main>
    );
  }

  const photos =
    typeof order.photos === "string"
      ? JSON.parse(order.photos)
      : order.photos;

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="mx-auto max-w-5xl px-6">

        <h1 className="text-4xl font-bold mb-3">
          Suas fotos estão liberadas 🎉
        </h1>

        <p className="text-neutral-400 mb-10">
          Obrigado pela compra!
        </p>

        <div className="grid gap-6 md:grid-cols-3">

          {photos.map((photo: any) => (
            <div
              key={photo.numero}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <img
                src={photo.thumbnail || photo.imagem}
                alt={`Foto ${photo.numero}`}
                className="rounded-lg mb-4"
              />

              <a
                href={`/api/download/${token}/${photo.numero}`}
                className="block text-center rounded-lg bg-red-600 px-4 py-3 font-bold hover:bg-red-700 transition"
              >
                Baixar foto #{photo.numero}
              </a>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}