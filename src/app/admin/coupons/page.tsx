import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function CouponsPage() {
  const { data } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl"><h1 className="mb-8 text-4xl font-bold">Cupons</h1><CouponManager coupons={data || []} /></div></main>;
}
