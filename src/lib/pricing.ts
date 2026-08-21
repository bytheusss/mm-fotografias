export const BASE_PHOTO_PRICE = 15;

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

export function calculatePrice(quantity: number) {
  const pricePerPhoto = unitPrice(quantity);
  const subtotal = quantity * BASE_PHOTO_PRICE;
  const total = quantity * pricePerPhoto;
  return { pricePerPhoto, subtotal, total, economy: subtotal - total, label: packageLabel(quantity) };
}
