import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculatePrice } from "@/lib/pricing";
import { getPricingPackages } from "@/lib/pricing-server";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "cart-lead"), 10, 60 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Muitas tentativas. Aguarde e tente novamente." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const items = Array.isArray(body.items) ? body.items.slice(0, 100) : [];
  if (!/^\S+@\S+\.\S+$/.test(email) || !items.length) return NextResponse.json({ skipped: true });
  const safeItems = items.map((item: Record<string, unknown>) => ({ id: String(item.id || ""), numero: String(item.numero || ""), slug: String(item.slug || ""), imagem: String(item.imagem || "") })).filter((item: { id: string }) => item.id);
  const pricing = calculatePrice(safeItems.length, await getPricingPackages());
  const values = { email, name: String(body.name || "").slice(0, 120), whatsapp: String(body.whatsapp || "").replace(/[^\d+]/g, "").slice(0, 20), photos: safeItems, quantity: safeItems.length, estimated_total: pricing.total, updated_at: new Date().toISOString() };
  const { data: existing } = await supabaseAdmin.from("abandoned_carts").select("id").eq("email", email).eq("status", "open").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const result = existing ? await supabaseAdmin.from("abandoned_carts").update(values).eq("id", existing.id) : await supabaseAdmin.from("abandoned_carts").insert(values);
  return result.error ? NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 }) : NextResponse.json({ success: true });
}
