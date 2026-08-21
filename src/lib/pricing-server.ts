import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_PRICING_PACKAGES, type PricingPackage } from "@/lib/pricing";
import { calculatePrice } from "@/lib/pricing";

export async function getPricingPackages(): Promise<PricingPackage[]> {
  const { data, error } = await supabaseAdmin.from("pricing_packages").select("min_quantity,unit_price,label").eq("active", true).order("min_quantity");
  if (error || !data?.length) return DEFAULT_PRICING_PACKAGES;
  return data.map(item => ({ minQuantity: Number(item.min_quantity), unitPrice: Number(item.unit_price), label: item.label }));
}

export async function getCartPricing(items: Array<{ id?: unknown }>) {
  const ids = [...new Set(items.map(item => String(item.id || "")).filter(Boolean))];
  const { data: photos, error } = await supabaseAdmin.from("photos").select("id,event_id,price,status").in("id", ids);
  if (error || !photos || photos.length !== ids.length || photos.some(photo => photo.status !== "available")) throw new Error("Uma ou mais fotos não estão disponíveis. Atualize o carrinho.");
  const eventIds = [...new Set(photos.map(photo => photo.event_id))];
  const [{ data: eventPackages }, globalPackages] = await Promise.all([
    supabaseAdmin.from("event_pricing_packages").select("event_id,min_quantity,unit_price,label").in("event_id", eventIds).eq("active", true).order("min_quantity"),
    getPricingPackages(),
  ]);
  const groups = Object.values(photos.reduce<Record<string, typeof photos>>((result, photo) => { (result[photo.event_id] ||= []).push(photo); return result; }, {}));
  const calculations = groups.map(group => { const own = (eventPackages || []).filter(row => row.event_id === group[0].event_id).map(row => ({ minQuantity: Number(row.min_quantity), unitPrice: Number(row.unit_price), label: row.label })); return calculatePrice(group.length, own.length ? own : globalPackages, Number(group[0].price || 15)); });
  return { pricePerPhoto: items.length ? calculations.reduce((sum, value) => sum + value.total, 0) / items.length : 0, subtotal: calculations.reduce((sum, value) => sum + value.subtotal, 0), total: calculations.reduce((sum, value) => sum + value.total, 0), economy: calculations.reduce((sum, value) => sum + value.economy, 0), label: calculations.map(value => value.label).filter(Boolean).join(" · ") };
}
