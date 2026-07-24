import { IMAGE_PATHS } from "@/lib/constants/images";
import { SITE } from "@/lib/constants/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SafeImage } from "@/components/ui/SafeImage";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center">
      <SafeImage
        src={IMAGE_PATHS.hero}
        fallbackSrc={IMAGE_PATHS.heroFallback}
        alt="Fotografia automotiva profissional"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <Container className="relative z-10 pt-20">
        <div className="max-w-3xl">
          <p className="opacity-0-initial animate-fade-in text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {SITE.name}
          </p>
          <h1 className="opacity-0-initial animate-slide-up animation-delay-100 mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {SITE.slogan}
          </h1>
          <p className="opacity-0-initial animate-slide-up animation-delay-200 mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {SITE.heroSubtitle}
          </p>
          <div className="opacity-0-initial animate-slide-up animation-delay-400 mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="#busca" size="lg" className="uppercase tracking-wider">
              Encontre suas Fotos
            </Button>
            <Button href="#eventos" variant="outline" size="lg">
              Últimos Eventos
            </Button>
          </div>
        </div>
      </Container>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-fade-in animation-delay-400">
        <div className="flex flex-col items-center gap-2 text-muted">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-muted to-transparent" />
        </div>
      </div>
    </section>
  );
}
