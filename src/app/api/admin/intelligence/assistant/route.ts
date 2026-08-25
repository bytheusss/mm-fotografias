import {NextResponse} from "next/server";
import {isApiAdmin} from "@/lib/api-auth";
import {supabaseAdmin} from "@/lib/supabaseAdmin";

export async function POST(request:Request){
 if(!(await isApiAdmin()))return NextResponse.json({error:"Acesso negado"},{status:403});
 const question=String((await request.json()).question||"").trim().slice(0,1000);
 if(!question)return NextResponse.json({error:"Faça uma pergunta"},{status:400});
 const[{data:orders},{data:events},{data:tasks},{data:expenses},{data:tickets}]=await Promise.all([
  supabaseAdmin.from("orders").select("status,total,created_at,email").order("created_at",{ascending:false}).limit(2000),
  supabaseAdmin.from("events").select("name,published,archived,total_photos,event_date").limit(200),
  supabaseAdmin.from("event_tasks").select("title,status,priority,due_at,events(name)").limit(500),
  supabaseAdmin.from("event_expenses").select("amount,category,expense_date,events(name)").limit(1000),
  supabaseAdmin.from("support_tickets").select("status,priority,last_message_at").limit(1000),
 ]);
 const paid=(orders||[]).filter(order=>order.status==="paid"),revenue=paid.reduce((sum,order)=>sum+Number(order.total||0),0),costs=(expenses||[]).reduce((sum,row)=>sum+Number(row.amount||0),0),localAnswer=`Resumo calculado diretamente no sistema: ${paid.length} pedido(s) pago(s), faturamento de ${revenue.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}, despesas registradas de ${costs.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} e lucro estimado de ${(revenue-costs).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}. Existem ${(tasks||[]).filter(task=>!["done","cancelled"].includes(task.status)).length} tarefa(s) e ${(tickets||[]).filter(ticket=>ticket.status!=="resolved").length} atendimento(s) em aberto.`;
 const key=process.env.GEMINI_API_KEY;
 if(!key)return NextResponse.json({answer:localAnswer,fallback:true});
 const context=JSON.stringify({orders,events,tasks,expenses,tickets}).slice(0,50000),model=process.env.GEMINI_MODEL||"gemini-3.7-flash";
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({systemInstruction:{parts:[{text:"Você é o analista operacional interno da M&M Fotografias. Responda em português do Brasil usando exclusivamente os dados fornecidos. Não invente números. Diferencie faturamento de lucro e informe quando faltarem dados. Seja direto, com no máximo 250 palavras e sugestões práticas. Nunca execute ações."}]},contents:[{role:"user",parts:[{text:`DADOS:\n${context}\n\nPERGUNTA: ${question}`}]}],generationConfig:{maxOutputTokens:1800,thinkingConfig:{thinkingLevel:"low"}}}),signal:AbortSignal.timeout(25000)}),data=await response.json(),answer=data?.candidates?.[0]?.content?.parts?.filter((part:{thought?:boolean})=>!part.thought).map((part:{text?:string})=>part.text||"").join("").trim();
  if(!response.ok||!answer)throw new Error(data?.error?.message||"Resposta indisponível");
  return NextResponse.json({answer});
 }catch(error){console.error("GEMINI INTELLIGENCE ERROR",error);return NextResponse.json({answer:`O Gemini está temporariamente indisponível, mas consegui calcular os dados principais.\n\n${localAnswer}`,fallback:true})}
}
