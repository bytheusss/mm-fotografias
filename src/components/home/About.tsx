import { SITE } from "@/lib/constants/site";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function About() {
  return (
    <section id="sobre" className="bg-background py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <SectionTitle title="Sobre a M&M" align="center" />
          <div className="space-y-6 text-center">
            {SITE.about.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="text-base leading-relaxed text-muted sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
