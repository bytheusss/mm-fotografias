export const BASE_PHOTO_PRICE = 15;

export type PricingPackage = { minQuantity: number; unitPrice: number; label: string };

export const DEFAULT_PRICING_PACKAGES: PricingPackage[] = [
  { minQuantity: 1, unitPrice: 15, label: "Preço padrão" },
  { minQuantity: 5, unitPrice: 12, label: "Pacote 5+ fotos" },
  { minQuantity: 10, unitPrice: 10, label: "Pacote 10+ fotos" },
];

export function unitPrice(quantity: number) {
  if (quantity >= 10) return 10;
  if (quantity >= 5) return 12;
  return BASE_PHOTO_PRICE;
}

export function packageLabel(quantity: number) {
  if (quantity >= 10) return "Pacote 10+ fotos aplicado (R$10 cada)";
  if (quantity >= 5) return "Pacote 5+ fotos aplicado (R$12 cada)";
  return "";
}

export function calculatePrice(quantity: number, packages: PricingPackage[] = DEFAULT_PRICING_PACKAGES, basePrice = BASE_PHOTO_PRICE) {
  const selected = [...packages].filter(item => item.minQuantity <= quantity).sort((a, b) => b.minQuantity - a.minQuantity)[0];
  const pricePerPhoto = selected?.unitPrice ?? basePrice;
  const subtotal = quantity * basePrice;
  const total = quantity * pricePerPhoto;
  const label = selected && selected.minQuantity > 1 ? `${selected.label} aplicado (R$${pricePerPhoto} cada)` : "";
  return { pricePerPhoto, subtotal, total, economy: subtotal - total, label };
}
