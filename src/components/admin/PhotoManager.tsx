"use client";

import { useEffect, useState } from "react";

export default function PhotoManager({
  eventId,
}: {
  eventId: string;
}) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [protecting, setProtecting] = useState(false);
  const [message, setMessage] = useState("");

  async function load(p = page) {
    const res = await fetch(
      `/api/admin/events/${eventId}/photos?page=${p}`
    );

    const data = await res.json();

    setPhotos(data.photos);
    setPages(data.pages);
    setPage(data.page);
  }

  useEffect(() => {
    load(1);
  }, []);

  async function remove(id: string) {
    if (!confirm("Excluir foto?")) return;

    await fetch(`/api/admin/photos/${id}`, {
      method: "DELETE",
    });

    load(page);
  }

  async function protect(id: string) { const response = await fetch(`/api/admin/events/${eventId}/photos/${id}`, { method: "PATCH" }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Falha ao reforçar proteção."); }
  async function protectPage() { if (!confirm(`Reprocessar as ${photos.length} fotos desta página usando os originais?`)) return; setProtecting(true); setMessage(""); let done = 0; try { for (const photo of photos) { setMessage(`Protegendo ${done + 1} de ${photos.length}…`); await protect(photo.id); done += 1; } setMessage(`${done} fotos atualizadas. Atualize a página pública para conferir.`); } catch (error) { setMessage(`${done} concluídas. ${error instanceof Error ? error.message : "Erro"}`); } finally { setProtecting(false); } }

  return (
    <div className="mt-12">

      <h2 className="text-2xl font-bold mb-5">
        Todas as fotos
      </h2>
      <div className="mb-5 flex flex-wrap items-center gap-3"><button type="button" disabled={protecting || !photos.length} onClick={protectPage} className="rounded bg-blue-700 px-4 py-2 font-bold disabled:opacity-50">{protecting ? "Processando…" : "Reforçar marca desta página"}</button><span className="text-sm text-neutral-400">Usa o original, portanto não duplica marcas existentes.</span></div>{message && <p className="mb-5 rounded bg-neutral-900 p-3 text-sm">{message}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

        {photos.map(photo => (

          <div
            key={photo.id}
            className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800"
          >

            <img
              alt={`Foto ${String(photo.number).padStart(4, "0")}`}
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.thumbnail_path}`}
              className="aspect-square object-cover w-full"
            />

            <div className="p-3">

              <p className="font-bold">
                #{String(photo.number).padStart(4, "0")}
              </p>

              <p className="text-sm text-neutral-400 mb-3">
                {photo.status}
              </p>

              <button
                type="button"
                disabled={protecting}
                onClick={async () => { setProtecting(true); try { await protect(photo.id); setMessage(`Foto #${String(photo.number).padStart(4, "0")} atualizada.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Erro"); } finally { setProtecting(false); } }}
                className="mb-2 w-full rounded bg-blue-700 py-2 disabled:opacity-50"
              >
                Reforçar marca
              </button>

              <button
                onClick={() => remove(photo.id)}
                className="w-full bg-red-600 py-2 rounded"
              >
                Excluir
              </button>

            </div>

          </div>

        ))}

      </div>

      <div className="flex justify-center gap-3 mt-8">

        <button
          disabled={page == 1}
          onClick={() => load(page - 1)}
          className="bg-neutral-700 px-4 py-2 rounded"
        >
          ←
        </button>

        <span>
          {page} / {pages}
        </span>

        <button
          disabled={page == pages}
          onClick={() => load(page + 1)}
          className="bg-neutral-700 px-4 py-2 rounded"
        >
          →
        </button>

      </div>

    </div>
  );
}
