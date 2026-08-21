import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { orderPhotos } from "@/lib/orders";

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return new Response("Não autenticado", { status: 401 });
  const { id } = await params;
  const { data: order } = await supabaseAdmin.from("orders").select("id,email,user_id,status,total,photos,created_at,coupon_code,discount_amount").eq("id", id).maybeSingle();
  if (!order || (order.user_id !== user.id && (order.user_id || order.email?.toLowerCase() !== user.email?.toLowerCase()))) return new Response("Pedido não encontrado", { status: 404 });
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Recibo ${escapeHtml(id)}</title><style>body{font:16px Arial;max-width:720px;margin:48px auto;padding:24px;color:#111}h1{margin-bottom:32px}.row{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:12px 0}@media print{button{display:none}}</style></head><body><h1>M&M Fotografias — Recibo</h1><div class="row"><b>Pedido</b><span>${escapeHtml(id)}</span></div><div class="row"><b>Data</b><span>${new Date(order.created_at).toLocaleString("pt-BR")}</span></div><div class="row"><b>Status</b><span>${escapeHtml(order.status)}</span></div><div class="row"><b>Fotos</b><span>${orderPhotos(order.photos).length}</span></div><div class="row"><b>Cupom</b><span>${escapeHtml(order.coupon_code || "—")}</span></div><div class="row"><b>Total</b><span>${Number(order.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div><p>Recibo de entrega digital. Não substitui documento fiscal quando este for legalmente exigido.</p><button onclick="print()">Imprimir / salvar em PDF</button></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
}
