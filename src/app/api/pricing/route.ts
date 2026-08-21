import { getPricingPackages } from "@/lib/pricing-server";

export async function GET() {
  return Response.json({ packages: await getPricingPackages() });
}
