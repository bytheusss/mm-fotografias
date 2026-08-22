import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/photographer-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET(){
  const staff=await getStaffUser(); if(!staff)return NextResponse.json({error:"Acesso negado."},{status:403});
  const id=staff.user.id;
  const [{data:profile},{data:photos},{data:orders},{data:payouts},{data:requests},{data:notifications}]=await Promise.all([
    supabaseAdmin.from("profiles").select("full_name,commission_rate,public_profile,monthly_goal").eq("id",id).single(),
    supabaseAdmin.from("photos").select("id,event_id").eq("photographer_id",id).is("deleted_at",null),
    supabaseAdmin.from("orders").select("total,photos").eq("status","paid"),
    supabaseAdmin.from("photographer_payouts").select("id,period_start,period_end,commission_amount,status,paid_at,receipt_url,created_at").eq("photographer_id",id).order("created_at",{ascending:false}).limit(20),
    supabaseAdmin.from("payout_requests").select("id,amount,status,created_at").eq("photographer_id",id).order("created_at",{ascending:false}).limit(10),
    supabaseAdmin.from("team_notifications").select("id,title,body,href,created_at").eq("user_id",id).order("created_at",{ascending:false}).limit(10),
  ]);
  const owned=new Set((photos||[]).map(photo=>photo.id)); let sold=0,revenue=0;
  for(const order of orders||[]){const items=Array.isArray(order.photos)?order.photos:[];const share=items.length?Number(order.total)/items.length:0;for(const item of items)if(owned.has(String(item.id))){sold++;revenue+=share;}}
  const commission=revenue*Number(profile?.commission_rate||0)/100; const paid=(payouts||[]).filter(p=>p.status==="paid").reduce((sum,p)=>sum+Number(p.commission_amount),0);
  return NextResponse.json({profile,stats:{uploaded:owned.size,sold,revenue,commission,paid,pending:Math.max(0,commission-paid),goal:Number(profile?.monthly_goal||0)},payouts:payouts||[],requests:requests||[],notifications:notifications||[]});
}
