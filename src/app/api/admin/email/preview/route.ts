import { renderPurchaseEmail } from "@/lib/email";
export async function GET() { const { html } = renderPurchaseEmail({ to: "admin", name: "Matheus", orderId: "7f27f242-demo", total: 105, quantity: 8, discount: 15, couponCode: "EVENTO10", token: "demonstracao", kind: "paid" }); return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }); }
