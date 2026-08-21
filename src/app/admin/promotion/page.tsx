import { PromotionForm } from "@/components/admin/PromotionForm";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export default async function PromotionPage() {
  const { data } = await supabaseAdmin.from("promotion_settings").select("active,message,link_url,link_label").eq("id", true).maybeSingle();
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-3xl"><h1 className="mb-3 text-4xl font-bold">Promoção do site</h1><p className="mb-8 text-neutral-400">Divulgue evento, cupom ou pacote sem contratar integração.</p><PromotionForm initial={data || { active: false, message: "", link_url: null, link_label: "Saiba mais" }} /></div></main>;
}
