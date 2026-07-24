import { getFeaturedPhotos } from "@/lib/events";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function Gallery() {
  const featuredPhotos = getFeaturedPhotos(6);

  return (
    <section id="galeria" className="bg-background-secondary py-20 md:py-28">
      <Container>
        <SectionTitle
          title="Fotos em Destaque"
          subtitle="Momentos capturados com precisão e elegância"
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {featuredPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              priority={index < 2}
              className={
                index === 0
                  ? "col-span-2 row-span-2 aspect-square md:aspect-auto md:min-h-[400px]"
                  : "aspect-square"
              }
              sizes={
                index === 0
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 768px) 50vw, 33vw"
              }
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
