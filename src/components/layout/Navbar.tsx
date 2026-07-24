"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { SITE } from "@/lib/constants/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-6"
      aria-hidden="true"
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      )}
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <Container as="nav" className="flex h-16 items-center justify-between lg:h-20">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground transition-opacity duration-300 hover:opacity-80 lg:text-xl"
        >
          {SITE.name}
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/login" variant="ghost" size="sm">
            Login
          </Button>
          <Button href="/cadastro" variant="outline" size="sm">
            Cadastrar
          </Button>
          <Button
            href="/carrinho"
            variant="secondary"
            size="sm"
            className="!px-3"
            aria-label="Carrinho"
          >
            <CartIcon />
          </Button>
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-sm text-foreground transition-colors duration-300 hover:bg-card lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </Container>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-3 py-3 text-sm text-muted transition-colors duration-300 hover:bg-card hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <Button href="/login" variant="ghost" size="md">
                Login
              </Button>
              <Button href="/cadastro" variant="outline" size="md">
                Cadastrar
              </Button>
              <Button href="/carrinho" variant="secondary" size="md">
                <CartIcon />
                Carrinho
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
