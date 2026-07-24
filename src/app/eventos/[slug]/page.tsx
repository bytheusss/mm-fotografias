import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { getAllEvents, getEventBySlug, getEventPhotos } from "@/lib/events";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return { title: "Evento não encontrado" };
  }

  return {
    title: event.name,
    description: `${event.name} — ${event.city} — ${event.date}. ${event.photoCount} fotos disponíveis.`,
    openGraph: {
      title: `${event.name} | M&M Fotografias`,
      description: `${event.photoCount} fotos do evento ${event.name}.`,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const photos = getEventPhotos(slug);

  return (
    <div className="bg-background pb-20 pt-24 md:pt-28">
      <Container>
        <div className="mb-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
            <SafeImage
              src={event.image}
              alt={event.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <Badge variant="primary" className="mb-4">
              {event.photoCount} fotos
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {event.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-muted">
              <span>{event.city}</span>
              <span>{event.date}</span>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
              Navegue pela galeria completa do evento. Copie suas fotos em{" "}
              <code className="rounded bg-background-secondary px-1.5 py-0.5 text-xs text-foreground">
                public/images/events/{slug}/
              </code>{" "}
              com os nomes 0001.jpg até 0157.jpg para exibi-las automaticamente.
            </p>
            <Button href="/#busca" className="mt-8">
              Buscar por Número
            </Button>
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                priority={index < 4}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-border bg-card p-12 text-center">
            <p className="text-muted">
              Galeria em preparação. Em breve as fotos estarão disponíveis.
            </p>
            <Button href="/" variant="outline" className="mt-6">
              Voltar para Home
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/#eventos"
            className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
          >
            ← Voltar para eventos
          </Link>
        </div>
      </Container>
    </div>
  );
}
