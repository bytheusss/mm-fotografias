import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";

const getPromotion = unstable_cache(
  async () => (await supabaseAdmin.from("promotion_settings").select("active,message,link_url,link_label").eq("id", true).maybeSingle()).data,
  ["public-promotion"],
  { revalidate: 60, tags: ["promotion"] },
);

export async function PromoBanner() {
  const data = await getPromotion();
  if (!data?.active || !data.message) return null;
  return <div className="bg-red-700 px-4 py-2 text-center text-sm font-semibold text-white">{data.message}{data.link_url && <> · <Link className="underline" href={data.link_url}>{data.link_label || "Saiba mais"}</Link></>}</div>;
}
