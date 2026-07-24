import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SafeImage } from "@/components/ui/SafeImage";
import { getEventBySlug, getEventPhoto, getEventPhotos } from "@/lib/events";

interface PhotoPageProps {
  params: Promise<{ slug: string; numero: string }>;
}

export async function generateStaticParams() {
  const { AACRC_SLUG } = await import("@/lib/events/aacrc-05072026");
  const photos = getEventPhotos(AACRC_SLUG);
  return photos.map((photo) => ({
    slug: photo.slug,
    numero: photo.numero,
  }));
}

export async function generateMetadata({
  params,
}: PhotoPageProps): Promise<Metadata> {
  const { slug, numero } = await params;
  const event = getEventBySlug(slug);
  const photo = getEventPhoto(slug, numero.padStart(4, "0"));

  if (!event || !photo) {
    return { title: "Foto não encontrada" };
  }

  return {
    title: `Foto #${photo.numero} — ${event.name}`,
    description: `Visualize a foto #${photo.numero} do evento ${event.name}.`,
    openGraph: {
      title: `Foto #${photo.numero} | ${event.name}`,
      description: `Foto #${photo.numero} — M&M Fotografias`,
      images: [{ url: photo.imagem }],
    },
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { slug, numero: rawNumero } = await params;
  const numero = rawNumero.padStart(4, "0");
  const event = getEventBySlug(slug);
  const photo = getEventPhoto(slug, numero);

  if (!event || !photo) {
    notFound();
  }

  return (
    <div className="bg-background pb-20 pt-24 md:pt-28">
      <Container>
        <div className="mb-8">
          <Link
            href={`/eventos/${slug}`}
            className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
          >
            ← Voltar para {event.name}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-card">
            <SafeImage
              src={photo.imagem}
              alt={`Foto ${photo.numero} — ${event.name}`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <Badge variant="primary" className="mb-4">
              Foto #{photo.numero}
            </Badge>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {event.name}
            </h1>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>Evento: {photo.evento}</p>
              <p>Cidade: {event.city}</p>
              <p>Data: {event.date}</p>
              <p>
                Preço:{" "}
                <span className="font-medium text-foreground">
                  R$ {photo.preco.toFixed(2).replace(".", ",")}
                </span>
              </p>
              <p>
                Status:{" "}
                <span className="capitalize text-foreground">{photo.status}</span>
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/carrinho" size="lg">
                Adicionar ao Carrinho
              </Button>
              <Button href={`/eventos/${slug}`} variant="outline" size="lg">
                Ver Galeria
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted">
              Integração com carrinho e pagamentos será disponibilizada em breve.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
