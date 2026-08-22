import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { FAQ } from "@/components/home/FAQ";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LatestEvents } from "@/components/home/LatestEvents";
import { QuickSearch } from "@/components/home/QuickSearch";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramPreview } from "@/components/home/InstagramPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickSearch />
      <LatestEvents />
      <HowItWorks />
      <About />
      <Gallery />
      <InstagramPreview />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
