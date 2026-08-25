export type ServicePackage = { slug: string; name: string; tagline: string; price: number | null; hours?: number; photos?: number; featured?: boolean; includes: string[] };
export type ServiceCategory = { slug: string; name: string; short: string; description: string; image: string; packages: ServicePackage[] };

export const SERVICE_CATALOG: ServiceCategory[] = [
  { slug: "casamento", name: "Casamentos", short: "Histórias completas, do sim à celebração.", description: "Coberturas exclusivamente fotográficas, com direção cuidadosa, registros espontâneos e galeria online.", image: "/images/services/casamento.webp", packages: [
    { slug: "essencial", name: "Essencial", tagline: "O momento principal com toda a emoção.", price: 1200, hours: 4, photos: 150, includes: ["Cerimônia completa", "Fotos com família e padrinhos", "Miniensaio pós-cerimônia", "150 fotos editadas", "Galeria online"] },
    { slug: "elegance", name: "Elegance", tagline: "Equilíbrio perfeito entre cobertura e investimento.", price: 2400, hours: 8, photos: 300, featured: true, includes: ["Making of da noiva", "Cerimônia completa", "Início da recepção", "Fotos espontâneas e convidados", "300 fotos editadas", "Galeria online e pen drive personalizado"] },
    { slug: "lux", name: "Lux", tagline: "A experiência completa e premium.", price: 3800, hours: 12, photos: 500, includes: ["Making of da noiva e do noivo", "Cerimônia e festa completas", "Direção de fotos editorial", "Detalhes, convidados e espontâneas", "500 fotos editadas", "Galeria online e pen drive premium"] },
  ]},
  { slug: "individual", name: "Ensaio individual", short: "Retratos com personalidade e direção.", description: "Para marcar fases, fortalecer sua imagem ou simplesmente celebrar quem você é.", image: "/images/services/individual.webp", packages: [] },
  { slug: "casal", name: "Ensaio de casal", short: "Conexão, afeto e momentos naturais.", description: "Ensaios de namoro, noivado, pré-wedding e celebrações a dois.", image: "/images/services/casal.webp", packages: [] },
  { slug: "gestante", name: "Gestante", short: "A espera registrada com delicadeza.", description: "Uma experiência acolhedora para eternizar uma fase única da família.", image: "/images/services/gestante.webp", packages: [] },
  { slug: "familia", name: "Família", short: "Memórias verdadeiras entre gerações.", description: "Ensaios leves e espontâneos para famílias de todos os tamanhos.", image: "/images/services/familia.webp", packages: [] },
  { slug: "aniversario", name: "Aniversários", short: "Cada abraço, surpresa e comemoração.", description: "Cobertura fotográfica de aniversários infantis, adultos e celebrações especiais.", image: "/images/services/aniversario.webp", packages: [] },
  { slug: "corporativo", name: "Corporativo", short: "Imagem profissional para pessoas e empresas.", description: "Retratos profissionais, equipes, produtos, ambientes e eventos corporativos.", image: "/images/services/corporativo.webp", packages: [] },
];

export function serviceBySlug(slug: string) { return SERVICE_CATALOG.find(service => service.slug === slug); }
export function money(value: number) { return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
