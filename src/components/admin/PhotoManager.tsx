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

  return (
    <div className="mt-12">

      <h2 className="text-2xl font-bold mb-5">
        Todas as fotos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

        {photos.map(photo => (

          <div
            key={photo.id}
            className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800"
          >

            <img
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
