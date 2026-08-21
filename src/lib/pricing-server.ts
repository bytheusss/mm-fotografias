import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DEFAULT_PRICING_PACKAGES, type PricingPackage } from "@/lib/pricing";

export async function getPricingPackages(): Promise<PricingPackage[]> {
  const { data, error } = await supabaseAdmin.from("pricing_packages").select("min_quantity,unit_price,label").eq("active", true).order("min_quantity");
  if (error || !data?.length) return DEFAULT_PRICING_PACKAGES;
  return data.map(item => ({ minQuantity: Number(item.min_quantity), unitPrice: Number(item.unit_price), label: item.label }));
}
