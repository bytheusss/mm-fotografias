import { TESTIMONIALS } from "@/lib/constants/mock-data";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-4 ${i < rating ? "text-primary" : "text-border"}`}
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

type Testimonial = { id: string | number; name: string; content: string; rating: number; role: string };

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return <Card hover className="flex flex-col">
    <StarRating rating={testimonial.rating} />
    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted sm:text-base">&ldquo;{testimonial.content}&rdquo;</blockquote>
    <footer className="mt-6 border-t border-border pt-4"><p className="font-medium text-foreground">{testimonial.name}</p><p className="text-sm text-muted">{testimonial.role}</p></footer>
  </Card>;
}

export async function Testimonials() {
  const { data } = await supabaseAdmin.from("purchase_reviews").select("id,customer_name,comment,rating").eq("target_type", "studio").eq("published", true).order("created_at", { ascending: false }).limit(6);
  const curated = [
    { id: "curated-maique", name: "Maíque", content: "Atendimento excelente e fotos com muita qualidade. Todo o processo foi simples, rápido e bem organizado.", rating: 5, role: "Cliente" },
    { id: "curated-ana-clara", name: "Ana Clara", content: "Amei o resultado das fotos! Um trabalho muito caprichado e uma experiência incrível do começo ao fim.", rating: 5, role: "Cliente" },
  ];
  const verified = (data || []).map(item => ({ id: item.id, name: item.customer_name, content: item.comment || "Excelente experiência com a M&M Fotografias.", rating: item.rating, role: "Compra verificada" }));
  const testimonials = [...verified, ...curated, ...TESTIMONIALS] as Testimonial[];
  const featured = testimonials.slice(0, 3);
  const remaining = testimonials.slice(3);
  return (
    <section className="bg-background py-20 md:py-28">
      <Container>
        <SectionTitle
          title="Depoimentos"
          subtitle="O que nossos clientes dizem sobre a M&M Fotografias"
        />

        <div className="grid gap-6 md:grid-cols-3">{featured.map(testimonial => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}</div>
        {remaining.length > 0 && <details className="group mt-8"><summary className="mx-auto block w-fit cursor-pointer list-none rounded-lg border border-border bg-surface px-6 py-3 font-bold text-foreground transition hover:border-primary hover:text-primary [&::-webkit-details-marker]:hidden"><span className="group-open:hidden">Ver mais avaliações ({remaining.length})</span><span className="hidden group-open:inline">Mostrar menos avaliações</span></summary><div className="mt-8 grid gap-6 md:grid-cols-3">{remaining.map(testimonial => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}</div></details>}
      </Container>
    </section>
  );
}
