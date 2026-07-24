import { LATEST_EVENTS } from "@/lib/constants/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function LatestEvents() {
  return (
    <section id="eventos" className="bg-background py-20 md:py-28">
      <Container>
        <SectionTitle
          title="Últimos Eventos"
          subtitle="Confira as coberturas mais recentes e encontre suas fotos"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LATEST_EVENTS.map((event) => (
            <Card key={event.id} hover className="group overflow-hidden !p-0">
              <div className="relative aspect-[16/10] overflow-hidden">
                <SafeImage
                  src={event.image}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <Badge className="mb-3">{event.photoCount} fotos</Badge>
                <h3 className="text-lg font-semibold text-foreground">
                  {event.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{event.city}</span>
                  <span>{event.date}</span>
                </div>
                <Button
                  href={`/eventos/${event.slug}`}
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full"
                >
                  Ver Galeria
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
