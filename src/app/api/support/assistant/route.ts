import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const windows=new Map<string,{count:number;reset:number}>();
function allowed(request:Request){const key=request.headers.get("x-forwarded-for")?.split(",")[0]||"local",now=Date.now(),item=windows.get(key);if(!item||item.reset<now){windows.set(key,{count:1,reset:now+60_000});return true}if(item.count>=12)return false;item.count++;return true}

export async function POST(request:Request){
 const started=Date.now();
 if(!allowed(request))return NextResponse.json({error:"Muitas mensagens. Aguarde um minuto."},{status:429});
 const body=await request.json(),question=String(body.question||"").trim().slice(0,1200),history=Array.isArray(body.history)?body.history.slice(-8):[];
 if(!question)return NextResponse.json({error:"Escreva sua dúvida."},{status:400});
 const apiKey=process.env.GEMINI_API_KEY;
 if(!apiKey)return NextResponse.json({configured:false,answer:"Ainda não consegui consultar a assistente inteligente. Posso organizar seus dados e encaminhar tudo diretamente para a equipe no WhatsApp."});
 const contents=[...history.map((item:{role?:string;text?:string})=>({role:item.role==="assistant"?"model":"user",parts:[{text:String(item.text||"").slice(0,1200)}]})),{role:"user",parts:[{text:question}]}];
 const {data:knowledge}=await supabaseAdmin.from("support_knowledge").select("title,content").eq("active",true).limit(30),official=(knowledge||[]).map(item=>`${item.title}: ${item.content}`).join("\n");
 const system=`Você é a assistente virtual da M&M Fotografias, de Rio Claro/SP. Faça pré-atendimento cordial e em português do Brasil. Use como fonte oficial somente a base abaixo. Se a resposta não estiver nela, diga que a equipe precisa confirmar. Nunca invente status de pedido, preço ou pagamento. Peça somente nome, WhatsApp, e-mail e número do pedido necessários. Não peça senha, cartão, código PIX nem documento. Responda em até 120 palavras, com instruções completas. Nunca termine uma frase pela metade. Ao final, ofereça encaminhar um resumo para o WhatsApp da equipe.\n\nBASE OFICIAL:\n${official||"Base ainda não cadastrada."}`;
 try{
  const model=process.env.GEMINI_MODEL||"gemini-3.7-flash";
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{maxOutputTokens:1200,thinkingConfig:{thinkingLevel:"low"}}}),signal:AbortSignal.timeout(20000)});
  const data=await response.json(),answer=data?.candidates?.[0]?.content?.parts?.filter((part:{thought?:boolean})=>!part.thought).map((part:{text?:string})=>part.text||"").join("").trim();
  if(!response.ok||!answer)throw new Error(data?.error?.message||"Gemini indisponível");
  const user=await getApiUser();await supabaseAdmin.from("ai_support_usage").insert({user_id:user?.id||null,model,success:true,latency_ms:Date.now()-started,question_chars:question.length,answer_chars:answer.length});
  return NextResponse.json({configured:true,answer});
 }catch(error){console.error("GEMINI SUPPORT ERROR",error);const user=await getApiUser();await supabaseAdmin.from("ai_support_usage").insert({user_id:user?.id||null,model:process.env.GEMINI_MODEL||"gemini-3.7-flash",success:false,latency_ms:Date.now()-started,question_chars:question.length,answer_chars:0});return NextResponse.json({configured:true,fallback:true,answer:"A assistente está temporariamente indisponível. Vou deixar sua solicitação pronta para continuar com a equipe pelo WhatsApp."});}
}
