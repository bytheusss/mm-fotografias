export interface NavLink {
  label: string;
  href: string;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  city: string;
  date: string;
  photoCount: number;
  image: string;
  shareMessage?: string | null;
  basePrice?: number;
  accessMode?: "public" | "unlisted" | "password";
}

export type PhotoStatus = "available" | "sold" | "reserved";

export interface EventPhoto {
  id: string;
  eventId?: string;
  numero: string;
  evento: string;
  slug: string;
  imagem: string;
  thumbnail: string;
  preco: number;
  status: PhotoStatus;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  numero: string;
  slug: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PhotoSearchParams {
  photoNumber: string;
}
