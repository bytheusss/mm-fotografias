import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function PromoBanner() {
  const { data } = await supabaseAdmin.from("promotion_settings").select("active,message,link_url,link_label").eq("id", true).maybeSingle();
  if (!data?.active || !data.message) return null;
  return <div className="bg-red-700 px-4 py-2 text-center text-sm font-semibold text-white">{data.message}{data.link_url && <> · <Link className="underline" href={data.link_url}>{data.link_label || "Saiba mais"}</Link></>}</div>;
}
