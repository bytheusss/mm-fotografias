import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function CouponsPage() {
  const [{ data }, { data: events }] = await Promise.all([supabaseAdmin.from("coupons").select("*,events(name)").order("created_at", { ascending: false }), supabaseAdmin.from("events").select("id,name").eq("archived", false).order("event_date", { ascending: false })]);
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl"><h1 className="mb-8 text-4xl font-bold">Cupons</h1><CouponManager coupons={data || []} events={events || []} /></div></main>;
}
