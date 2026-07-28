import { getFeaturedPhotos } from "@/lib/events";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";


export async function Gallery() {

  const featuredPhotos =
    await getFeaturedPhotos();


  return (
    <section className="py-16">

      <Container>

        <SectionTitle
          title="Fotos recentes"
          subtitle="Confira alguns dos nossos últimos registros."
        />


        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">

          {featuredPhotos.map((photo) => (

            <PhotoCard
              key={photo.id}
              photo={photo}
            />

          ))}

        </div>


      </Container>

    </section>
  );
}