import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { allRoles, type AppRole } from "@/lib/roles";
import { sendPush } from "@/lib/push";

const STAFF: AppRole[] = ["owner", "admin", "support", "photographer"];
const MANAGEMENT: AppRole[] = ["owner", "admin", "support"];
type Actor = Awaited<ReturnType<typeof actor>>;

async function actor() {
  const user = await getApiUser(); if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("id,full_name,email,role,roles").eq("id", user.id).maybeSingle();
  if (!profile) return null; const roles = allRoles(profile);
  return { user, profile, roles, staff: roles.some(role => STAFF.includes(role)), management: roles.some(role => MANAGEMENT.includes(role)) };
}
function direct(a:string,b:string){return `direct:${[a,b].sort().join(":")}`}
function hasRole(person:{role?:string|null;roles?:string[]|null},allowed:AppRole[]){return allRoles(person).some(role=>allowed.includes(role))}

async function context(me:NonNullable<Actor>,mode:string,other:string){
  const { data: people } = await supabaseAdmin.from("profiles").select("id,full_name,email,role,roles").neq("id",me.user.id).order("full_name");
  if(mode==="team") return me.staff?{channel:"team",people:(people||[]).filter(p=>hasRole(p,STAFF))}:null;
  if(mode==="management") return me.management?{channel:"management",people:(people||[]).filter(p=>hasRole(p,MANAGEMENT))}:null;
  if(mode==="support"){
    if(me.management){return {channel:other?`support:${other}`:"",people:(people||[]).filter(p=>!hasRole(p,STAFF))}}
    if(me.staff)return null;
    return {channel:`support:${me.user.id}`,people:[]};
  }
  if(mode==="direct"){
    const allowed=(people||[]).filter(p=>me.staff?hasRole(p,STAFF):hasRole(p,["photographer"]));
    if(!other)return {channel:"",people:allowed};
    if(!allowed.some(p=>p.id===other))return null;
    return {channel:direct(me.user.id,other),people:allowed};
  }
  return null;
}

export async function GET(request:Request){
  const me=await actor();if(!me)return NextResponse.json({error:"Não autenticado"},{status:401});
  const q=new URL(request.url).searchParams,mode=q.get("mode")||"support",other=q.get("other")||"",ctx=await context(me,mode,other);
  if(!ctx)return NextResponse.json({error:"Acesso negado"},{status:403});
  if(!ctx.channel)return NextResponse.json({messages:[],people:ctx.people,me:me.user.id,roles:me.roles,channel:"",quickReplies:[]});
  const {data:messages,error}=await supabaseAdmin.from("chat_messages").select("id,channel,sender_id,recipient_id,body,read_at,created_at,profiles!chat_messages_sender_id_fkey(full_name,email)").eq("channel",ctx.channel).order("created_at").limit(200);
  if(error)return NextResponse.json({error:error.message},{status:400});
  const readAt=new Date().toISOString();
  await Promise.all([supabaseAdmin.from("chat_messages").update({read_at:readAt}).eq("channel",ctx.channel).eq("recipient_id",me.user.id).is("read_at",null),supabaseAdmin.from("chat_read_state").upsert({channel:ctx.channel,user_id:me.user.id,last_read_at:readAt})]);
  const {data:ticket}=mode==="support"?await supabaseAdmin.from("support_tickets").select("status,priority,assigned_to,rating,feedback").eq("channel",ctx.channel).maybeSingle():{data:null};
  const {data:quickReplies}=me.management?await supabaseAdmin.from("support_quick_replies").select("id,title,body").eq("active",true).order("title"):{data:[]};
  return NextResponse.json({messages:messages||[],people:ctx.people,me:me.user.id,roles:me.roles,channel:ctx.channel,ticket,quickReplies:quickReplies||[]},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(request:Request){
  const me=await actor();if(!me)return NextResponse.json({error:"Não autenticado"},{status:401});
  const body=await request.json(),mode=String(body.mode||"support"),other=String(body.other||""),text=String(body.body||"").trim().slice(0,2000),ctx=await context(me,mode,other);
  if(!text)return NextResponse.json({error:"Mensagem vazia"},{status:400}); if(!ctx?.channel)return NextResponse.json({error:"Conversa inválida"},{status:403});
  let recipient:string|null=null;
  if(mode==="direct")recipient=other;
  else if(mode==="support")recipient=me.management?other:null;
  const {data:created,error}=await supabaseAdmin.from("chat_messages").insert({channel:ctx.channel,sender_id:me.user.id,recipient_id:recipient,body:text}).select("id,channel,sender_id,recipient_id,body,read_at,created_at").single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  if(mode==="support"){const{data:ticket}=await supabaseAdmin.from("support_tickets").select("status,assigned_to").eq("channel",ctx.channel).maybeSingle();const nextStatus=me.management?"in_progress":ticket?.status==="resolved"?"reopened":ticket?.status||"waiting";await supabaseAdmin.from("support_tickets").upsert({channel:ctx.channel,client_id:me.management?other:me.user.id,status:nextStatus,assigned_to:me.management?me.user.id:ticket?.assigned_to||null,last_message_at:created.created_at,updated_at:created.created_at},{onConflict:"channel"});}
  let recipients:string[]=[];
  if(recipient)recipients=[recipient];
  else if(mode==="support"){
    const {data}=await supabaseAdmin.from("profiles").select("id,role,roles").neq("id",me.user.id);recipients=(data||[]).filter(p=>hasRole(p,MANAGEMENT)).map(p=>p.id);
  }else if(mode==="team"||mode==="management"){
    const allowed=mode==="team"?STAFF:MANAGEMENT,{data}=await supabaseAdmin.from("profiles").select("id,role,roles").neq("id",me.user.id);recipients=(data||[]).filter(p=>hasRole(p,allowed)).map(p=>p.id);
  }
  const href=mode==="team"||mode==="management"?"/fotografo/chat":me.staff?"/ajuda":"/fotografo/chat";
  await Promise.all(recipients.map(id=>sendPush(id,{title:`Nova mensagem de ${me.profile.full_name||"M&M"}`,body:text,href}).catch(()=>undefined)));
  return NextResponse.json({success:true,message:{...created,profiles:{full_name:me.profile.full_name,email:me.profile.email}}});
}
