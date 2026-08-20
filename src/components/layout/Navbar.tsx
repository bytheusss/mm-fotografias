"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { NAV_LINKS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants/site";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";


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
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
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

  const { items } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((result: { data: { user: unknown } }) => setAuthenticated(Boolean(result.data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => setAuthenticated(Boolean(session?.user)));
    return () => listener.subscription.unsubscribe();
  }, []);



  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);




  useEffect(() => {

    document.body.style.overflow =
      mobileOpen ? "hidden" : "";

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
          : "bg-background/60 backdrop-blur-sm"
      )}
    >

      <Container
        as="nav"
        className="flex h-20 items-center justify-between lg:h-24"
      >


        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >

          <Image
            src="/images/logo.png"
            alt={SITE.name}
            width={180}
            height={60}
            className="h-10 w-auto object-contain lg:h-12"
            priority
          />

        </Link>




        <ul className="hidden items-center gap-8 lg:flex">

          {NAV_LINKS.map((link) => (

            <li key={link.href}>

              <Link
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>

            </li>

          ))}

        </ul>




        <div className="hidden items-center gap-3 lg:flex">


          <Button
            href={authenticated ? "/minha-conta" : "/login"}
            variant="ghost"
            size="sm"
          >
            {authenticated ? "Minha Conta" : "Login"}
          </Button>



          {!authenticated && <Button
            href="/cadastro"
            variant="outline"
            size="sm"
          >
            Cadastrar
          </Button>}




          <Button
            href="/carrinho"
            variant="secondary"
            size="sm"
            className="relative !px-3"
            aria-label="Carrinho"
          >

            <CartIcon />


            {items.length > 0 && (

              <span
                className="
                absolute -right-2 -top-2
                flex size-5 items-center justify-center
                rounded-full
                bg-red-600
                text-xs font-bold text-white
                "
              >
                {items.length}
              </span>

            )}


          </Button>


        </div>





        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-sm text-foreground hover:bg-card lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >

          <MenuIcon open={mobileOpen} />

        </button>


      </Container>





      {mobileOpen && (

        <div className="border-t border-border bg-background/95 backdrop-blur-md lg:hidden">


          <Container className="flex flex-col gap-1 py-4">


            {NAV_LINKS.map((link) => (

              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-3 py-3 text-sm text-muted hover:bg-card"
              >

                {link.label}

              </Link>

            ))}





            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">


              <Button href={authenticated ? "/minha-conta" : "/login"} variant="ghost">
                {authenticated ? "Minha Conta" : "Login"}
              </Button>


              {!authenticated && <Button href="/cadastro" variant="outline">
                Cadastrar
              </Button>}



              <Button
                href="/carrinho"
                variant="secondary"
                className="relative"
              >

                <CartIcon />

                Carrinho


                {items.length > 0 && (

                  <span
                    className="
                    absolute right-3 top-2
                    flex size-5 items-center justify-center
                    rounded-full
                    bg-red-600
                    text-xs font-bold text-white
                    "
                  >
                    {items.length}
                  </span>

                )}


              </Button>


            </div>


          </Container>


        </div>

      )}


    </header>
  );
}
