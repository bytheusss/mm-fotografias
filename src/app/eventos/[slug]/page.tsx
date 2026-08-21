import { notFound } from "next/navigation";

import {
  getEventBySlug,
  getEventPhotos,
  getAllEvents,
} from "@/lib/events";

import { Container } from "@/components/ui/Container";
import { PhotoSearch } from "@/components/event/PhotoSearch";

export const revalidate = 300;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return (await getAllEvents()).map(event => ({ slug: event.slug }));
}

export default async function EventoPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const photos = await getEventPhotos(slug);

  return (
    <main className="min-h-screen bg-black text-white">
      <Container>
        <section className="pb-16 pt-20">

          <div className="mb-10">

            <span className="rounded bg-red-600 px-3 py-1 text-sm font-bold">
              {event.photoCount} FOTOS
            </span>

            <h1 className="mt-5 text-5xl font-bold">
              {event.name}
            </h1>

            <p className="mt-3 text-gray-400">
              {event.city} • {event.date}
            </p>

          </div>

          <PhotoSearch photos={photos} />

        </section>
      </Container>
    </main>
  );
}
