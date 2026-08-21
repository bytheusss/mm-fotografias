import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getApiUser } from "@/lib/api-auth";
import { applyCoupon } from "@/lib/coupons";
import { getCartPricing } from "@/lib/pricing-server";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });
export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "checkout-pro"), 5, 10 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  try {
    const body = await request.json(); const items = Array.isArray(body.items) ? body.items : []; const email = String(body.email || "").trim().toLowerCase(); const name = String(body.name || "").trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !items.length || items.length > 100) return NextResponse.json({ error: "Confira nome, e-mail e itens do carrinho." }, { status: 400 });
    const user = await getApiUser(); if (user?.email && user.email.toLowerCase() !== email) return NextResponse.json({ error: "Use o e-mail da sua conta." }, { status: 400 });
    const pricing = await getCartPricing(items); const coupon = await applyCoupon(body.couponCode, pricing.total, items.map((item: { slug?: unknown }) => String(item.slug || ""))); const total = coupon.total;
    const { data: order, error } = await supabaseAdmin.from("orders").insert({ name, email, whatsapp: String(body.whatsapp || ""), photos: items, total, coupon_code: coupon.code, discount_amount: coupon.discount, status: "pending", user_id: user?.id || null }).select("id").single();
    if (error || !order) throw error || new Error("Pedido não criado");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const preference = await new Preference(client).create({ body: {
      items: [{ id: String(order.id), title: `${items.length} foto(s) M&M Fotografias`, quantity: 1, unit_price: Number(total), currency_id: "BRL" }],
      payer: { name, email }, external_reference: String(order.id), statement_descriptor: "MM FOTOGRAFIAS",
      payment_methods: { installments: 12, excluded_payment_types: [{ id: "ticket" }] },
      back_urls: { success: `${siteUrl}/minha-conta?pagamento=sucesso`, pending: `${siteUrl}/minha-conta?pagamento=pendente`, failure: `${siteUrl}/checkout?pagamento=falhou` },
      auto_return: "approved", notification_url: `${siteUrl}/api/webhooks/mercadopago`, expires: true, expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, requestOptions: { idempotencyKey: crypto.randomUUID() } });
    if (!preference.init_point) throw new Error("Checkout não retornado pelo Mercado Pago");
    await supabaseAdmin.from("orders").update({ mercado_pago_payment_id: `preference:${preference.id}` }).eq("id", order.id);
    return NextResponse.json({ checkout_url: preference.init_point, order_id: order.id });
  } catch (error) { console.error("CHECKOUT PRO ERROR", error); return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao abrir pagamento" }, { status: 500 }); }
}
