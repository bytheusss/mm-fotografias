export type OrderPhoto = { id?: string; numero?: string | number; imagem?: string; thumbnail_url?: string };
export function orderPhotos(value: unknown): OrderPhoto[] {
  if (Array.isArray(value)) return value as OrderPhoto[];
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
  return [];
}
export function money(value: unknown) { return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
export function statusLabel(value: string) { return ({ paid: "Pagamento aprovado", approved: "Pagamento aprovado", pending: "Pagamento pendente", cancelled: "Cancelado", canceled: "Cancelado", rejected: "Recusado" } as Record<string,string>)[value] || value; }
