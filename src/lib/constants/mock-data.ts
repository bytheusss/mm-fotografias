import { eventCoverPath } from "@/lib/constants/images";
import { AACRC_EVENT } from "@/lib/events/aacrc-05072026";
import type { FAQItem, HowItWorksStep, Testimonial } from "@/types";

export const LATEST_EVENTS = [
  AACRC_EVENT,
  {
    id: "sao-pedro-drift-fest",
    slug: "sao-pedro-drift-fest",
    name: "São Pedro Drift Fest",
    city: "São Pedro, SP",
    date: "15 Mar 2026",
    photoCount: 1240,
    image: eventCoverPath("sao-pedro-drift-fest"),
  },
  {
    id: "track-day-interlagos",
    slug: "track-day-interlagos",
    name: "Track Day",
    city: "Interlagos, SP",
    date: "08 Fev 2026",
    photoCount: 2103,
    image: eventCoverPath("track-day-interlagos"),
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Encontre sua foto",
    description:
      "Digite o número da sua foto ou navegue pelos eventos disponíveis na plataforma.",
  },
  {
    step: 2,
    title: "Adicione ao carrinho",
    description:
      "Selecione as fotos desejadas e adicione ao carrinho para compra segura.",
  },
  {
    step: 3,
    title: "Receba em alta resolução",
    description:
      "Após a confirmação do pagamento, receba suas fotos em alta resolução para download.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rafael Mendes",
    role: "Entusiasta automotivo",
    content:
      "As fotos do Encontro AACRC ficaram incríveis. Qualidade profissional e entrega rápida. Recomendo demais a M&M!",
    rating: 5,
  },
  {
    id: "2",
    name: "Camila Souza",
    role: "Organizadora de eventos",
    content:
      "Parceria impecável em nosso encontro de carros. A equipe capturou cada momento com maestria e elegância.",
    rating: 5,
  },
  {
    id: "3",
    name: "Lucas Ferreira",
    role: "Piloto amador",
    content:
      "Meu ensaio personalizado superou todas as expectativas. Fotos dignas de capa de revista automotiva.",
    rating: 5,
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "Como encontro minhas fotos?",
    answer:
      "Digite o número da sua foto na busca rápida ou navegue até a galeria do evento em que participou. Em breve, a busca será integrada diretamente ao Supabase.",
  },
  {
    id: "2",
    question: "Quanto tempo leva para receber as fotos?",
    answer:
      "Após a confirmação do pagamento, suas fotos em alta resolução ficam disponíveis para download imediato na plataforma.",
  },
  {
    id: "3",
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitaremos cartão de crédito, PIX e boleto bancário. A integração de pagamentos será disponibilizada em breve.",
  },
  {
    id: "4",
    question: "Posso solicitar um ensaio personalizado?",
    answer:
      "Sim! Entre em contato pelo WhatsApp ou solicite um orçamento pelo botão na seção de contato. Faremos um projeto exclusivo para você.",
  },
  {
    id: "5",
    question: "As fotos são entregues em alta resolução?",
    answer:
      "Sim, todas as fotos adquiridas são entregues em alta resolução, prontas para impressão ou uso digital.",
  },
];
