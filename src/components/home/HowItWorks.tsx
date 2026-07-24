import { HOW_IT_WORKS_STEPS } from "@/lib/constants/mock-data";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function HowItWorks() {
  return (
    <section className="bg-background-secondary py-20 md:py-28">
      <Container>
        <SectionTitle
          title="Como Funciona"
          subtitle="Três passos simples para ter suas fotos em alta resolução"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <Card key={step.step} hover className="relative text-center">
              <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-sm border border-primary bg-primary/10 text-2xl font-semibold text-primary">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
