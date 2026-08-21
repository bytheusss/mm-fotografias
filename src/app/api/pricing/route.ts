import { getPricingPackages } from "@/lib/pricing-server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const packages = await getPricingPackages();
  const eventIds = (new URL(request.url).searchParams.get("eventIds") || "").split(",").filter(Boolean).slice(0, 20);
  if (!eventIds.length) return Response.json({ packages, eventPackages: {} });
  const { data } = await supabaseAdmin.from("event_pricing_packages").select("event_id,min_quantity,unit_price,label").in("event_id", eventIds).eq("active", true).order("min_quantity");
  const eventPackages: Record<string, typeof packages> = {};
  for (const row of data || []) (eventPackages[row.event_id] ||= []).push({ minQuantity: Number(row.min_quantity), unitPrice: Number(row.unit_price), label: row.label });
  return Response.json({ packages, eventPackages });
}
