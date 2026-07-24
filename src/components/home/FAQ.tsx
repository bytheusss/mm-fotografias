import { FAQ_ITEMS } from "@/lib/constants/mock-data";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FAQ() {
  return (
    <section id="faq" className="bg-background-secondary py-20 md:py-28">
      <Container>
        <SectionTitle
          title="Perguntas Frequentes"
          subtitle="Tire suas dúvidas sobre a plataforma"
        />

        <div className="mx-auto max-w-3xl">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </Container>
    </section>
  );
}
