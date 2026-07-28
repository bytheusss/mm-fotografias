import { AACRC_EVENT } from "@/lib/events/aacrc-05072026";
import type { FAQItem, HowItWorksStep, Testimonial } from "@/types";

export const LATEST_EVENTS = [
  AACRC_EVENT,
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Encontre sua foto",
    description:
      "Digite o número da sua foto ou navegue pelos eventos disponíveis.",
  },
  {
    step: 2,
    title: "Adicione ao carrinho",
    description:
      "Escolha suas fotos e adicione ao carrinho.",
  },
  {
    step: 3,
    title: "Baixe em alta resolução",
    description:
      "Após o pagamento, faça o download imediatamente.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rafael Mendes",
    role: "Entusiasta automotivo",
    content:
      "As fotos ficaram incríveis. Qualidade profissional e entrega rápida.",
    rating: 5,
  },
  {
    id: "2",
    name: "Camila Souza",
    role: "Organizadora de eventos",
    content:
      "Excelente cobertura. Recomendo demais.",
    rating: 5,
  },
  {
    id: "3",
    name: "Lucas Ferreira",
    role: "Piloto",
    content:
      "As fotos ficaram perfeitas.",
    rating: 5,
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "Como encontro minhas fotos?",
    answer:
      "Digite o número da foto ou entre na galeria do evento.",
  },
  {
    id: "2",
    question: "Quando recebo minhas fotos?",
    answer:
      "Logo após a confirmação do pagamento.",
  },
  {
    id: "3",
    question: "Quais formas de pagamento?",
    answer:
      "PIX e cartão.",
  },
];