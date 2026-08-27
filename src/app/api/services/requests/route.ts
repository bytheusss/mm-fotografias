import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getApiUser } from "@/lib/api-auth";
import { serviceBySlug } from "@/lib/service-catalog";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";
import { sendPush } from "@/lib/push";
import { hasRole } from "@/lib/roles";

export async function POST(request: Request) {
  const rate=checkRateLimit(requestKey(request,"service-request"),4,60*60*1000);
  if(!rate.allowed)return NextResponse.json({error:"Muitas solicitações. Aguarde um pouco."},{status:429});
  try {
    const body=await request.json(),serviceSlug=String(body.serviceSlug||""),service=serviceBySlug(serviceSlug),name=String(body.clientName||"").trim(),email=String(body.email||"").trim().toLowerCase(),whatsapp=String(body.whatsapp||"").replace(/\D/g,"");
    if(!service||name.length<2||!/^\S+@\S+\.\S+$/.test(email)||whatsapp.length<10||body.consent!=="yes")return NextResponse.json({error:"Confira nome, e-mail, WhatsApp e autorização."},{status:400});
    const user=await getApiUser();
    const{data,error}=await supabaseAdmin.from("service_requests").insert({user_id:user?.id||null,service_slug:serviceSlug,package_slug:String(body.packageSlug||"")||null,client_name:name.slice(0,120),email,whatsapp,event_date:body.eventDate||null,city:String(body.city||"").slice(0,120)||null,venue:String(body.venue||"").slice(0,200)||null,guests:Number(body.guests)||null,budget:Number(body.budget)||null,notes:String(body.notes||"").slice(0,2000)||null}).select("id,protocol").single();
    if(error||!data)throw error||new Error("Solicitação não criada");
    const{data:profiles}=await supabaseAdmin.from("profiles").select("id,role,roles");
    const team=(profiles||[]).filter(person=>hasRole(person,["owner","admin","support"]));
    const notice={title:"Novo pedido de orçamento 📷",body:`${name} quer ${service.name}${body.packageSlug?` · pacote ${body.packageSlug}`:""}.`,href:"/admin/studio"};
    await Promise.all((team||[]).map(async person=>{await supabaseAdmin.from("team_notifications").insert({user_id:person.id,...notice});await sendPush(person.id,notice).catch(()=>undefined)}));
    return NextResponse.json({success:true,protocol:data.protocol});
  } catch(error){console.error("SERVICE REQUEST ERROR",error);return NextResponse.json({error:"Não foi possível registrar. Confirme se a atualização V20 do banco foi aplicada."},{status:500})}
}
