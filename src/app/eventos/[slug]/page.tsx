import { notFound } from "next/navigation";

import {
  getEventBySlug,
  getEventPhotos,
  getAllEvents,
} from "@/lib/events";

import { Container } from "@/components/ui/Container";
import { PhotoSearch } from "@/components/event/PhotoSearch";
import { EventShareTools } from "@/components/event/EventShareTools";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { EventPasswordGate } from "@/components/event/EventPasswordGate";
import { hasEventAccess } from "@/lib/event-access";
import type { Metadata } from "next";
import { SITE } from "@/lib/constants/site";

export const revalidate = 300;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return (await getAllEvents()).map(event => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const { slug } = await params; const event = await getEventBySlug(slug); if (!event) return {}; const description = `Encontre e compre suas fotos do evento ${event.name}, realizado em ${event.city} em ${event.date}.`; const privateAlbum = event.accessMode !== "public"; return { title: event.name, description, alternates: { canonical: `/eventos/${event.slug}` }, robots: privateAlbum ? { index: false, follow: false } : undefined, openGraph: { title: `${event.name} | ${SITE.name}`, description, url: `/eventos/${event.slug}`, images: event.image ? [{ url: event.image, alt: event.name }] : undefined, type: "website" }, twitter: { card: "summary_large_image", title: event.name, description, images: event.image ? [event.image] : undefined } }; }

export default async function EventoPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }
  if (event.accessMode === "password" && !(await hasEventAccess(event.id, event.passwordVersion))) return <EventPasswordGate slug={event.slug} name={event.name} />;

  const photos = await getEventPhotos(slug);

  return (
    <main className="min-h-screen bg-black text-white">
      <ViewTracker eventId={event.id} />
      <Container>
        <section className="pb-16 pt-32">

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

            <EventShareTools title={event.name} initialMessage={event.shareMessage} />
            {event.salesPaused && <div className="mt-6 rounded-xl border border-yellow-700 bg-yellow-950/50 p-4 font-semibold text-yellow-200">Vendas temporariamente pausadas. Você ainda pode visualizar e favoritar as fotos.</div>}

          </div>

          <PhotoSearch photos={photos} />

        </section>
      </Container>
    </main>
  );
}
