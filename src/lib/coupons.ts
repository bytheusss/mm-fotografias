import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function applyCoupon(code: string | undefined, subtotal: number) {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return { code: null, discount: 0, total: subtotal };
  const { data } = await supabaseAdmin.from("coupons").select("code,kind,value,active,expires_at,max_uses,uses").eq("code", normalized).maybeSingle();
  const valid = data?.active && (!data.expires_at || new Date(data.expires_at) > new Date()) && (!data.max_uses || data.uses < data.max_uses);
  if (!valid) throw new Error("Cupom inválido ou expirado");
  const raw = data.kind === "percent" ? subtotal * Number(data.value) / 100 : Number(data.value);
  const discount = Math.min(subtotal, Math.round(raw * 100) / 100);
  return { code: data.code, discount, total: Math.max(0, subtotal - discount) };
}
