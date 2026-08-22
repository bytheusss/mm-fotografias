import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PromoBanner } from "@/components/layout/PromoBanner";
import { SITE } from "@/lib/constants/site";
import { CartProvider } from "@/context/CartContext";
import { CookiePreferences } from "@/components/privacy/CookiePreferences";
import { AppExperience } from "@/components/layout/AppExperience";

import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  icons: { icon: "/images/logo.png", shortcut: "/images/logo.png", apple: "/images/logo.png" },
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.seoDescription,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: SITE.name,
    description: SITE.seoDescription,
    url: SITE.url,
    siteName: SITE.name,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.seoDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b0c0e" };


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >

      <body className="flex min-h-full flex-col overflow-x-clip bg-background font-sans text-foreground">

        <CartProvider>

          <Navbar />
          <PromoBanner />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
          <CookiePreferences />
          <AppExperience />

        </CartProvider>

      </body>

    </html>
  );
}
