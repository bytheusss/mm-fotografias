"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function QuickSearch() {
  const [photoNumber, setPhotoNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!photoNumber.trim()) {
      setMessage("Digite o número da sua foto para buscar.");
      return;
    }

    setLoading(true);
    setMessage(null);

    // Prepared for future Supabase integration:
    // const { data, error } = await supabase
    //   .from("photos")
    //   .select("*")
    //   .eq("numero", photoNumber.trim().padStart(4, "0"))
    //   .single();

    await new Promise((resolve) => setTimeout(resolve, 800));

    setLoading(false);
    setMessage(
      `Busca preparada para o número "${photoNumber.trim()}". Integração com Supabase em breve.`
    );
  }

  return (
    <section id="busca" className="relative -mt-16 z-20 pb-8">
      <Container>
        <div className="rounded-sm border border-border bg-card p-6 shadow-2xl shadow-black/30 sm:p-8 md:p-10">
          <div className="mb-6 text-center md:mb-8">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Busca Rápida
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Encontre suas fotos pelo número de identificação
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-stretch"
          >
            <input
              name="photoNumber"
              type="text"
              inputMode="numeric"
              placeholder="Digite o número da foto (Ex.: 0048)"
              value={photoNumber}
              onChange={(e) => setPhotoNumber(e.target.value)}
              disabled={loading}
              aria-label="Número da foto"
              className="flex-1 rounded-sm border border-border bg-background-secondary px-6 py-4 text-lg text-foreground placeholder:text-muted/60 transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="shrink-0 px-10 py-4 text-base uppercase tracking-wider sm:min-w-[160px]"
            >
              Buscar
            </Button>
          </form>

          {message && (
            <p
              className="mx-auto mt-4 max-w-3xl text-center text-sm text-muted"
              role="status"
            >
              {message}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
