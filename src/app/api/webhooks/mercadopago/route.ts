import { NextResponse } from "next/server";

import {
  MercadoPagoConfig,
  Payment,
} from "mercadopago";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sendPurchaseEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendPush } from "@/lib/push";
import {allRoles} from "@/lib/roles";


const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});



export async function POST(
  request: Request
) {

  try {


    const rawBody = await request.text();
    const body =
      JSON.parse(rawBody);

    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("x-signature") || "";
      const requestId = request.headers.get("x-request-id") || "";
      const parts = Object.fromEntries(signature.split(",").map(part => part.trim().split("=")));
      const dataId = new URL(request.url).searchParams.get("data.id") || body.data?.id;
      const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
      const expected = createHmac("sha256", webhookSecret).update(manifest).digest("hex");
      const received = parts.v1 || "";
      if (expected.length !== received.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
    }



    console.log(
      "WEBHOOK MERCADO PAGO:",
      JSON.stringify(body, null, 2)
    );



    let paymentId = null;



    // Evento payment
    if(
      body.type === "payment"
    ){

      paymentId =
        body.data?.id;

    }



    // Evento order (PIX novo)
    if(
      body.type === "order"
    ){

      paymentId =
        body.data
        ?.transactions
        ?.payments?.[0]
        ?.id;

    }



    if(!paymentId){

      console.log(
        "SEM PAYMENT ID"
      );

      return NextResponse.json({
        received:true
      });

    }




    const paymentApi =
      new Payment(client);



    const payment =
      await paymentApi.get({

        id:String(paymentId)

      });



    console.log(
      "PAYMENT ID:",
      payment.id
    );


    console.log(
      "STATUS:",
      payment.status
    );




    if(
      payment.status !== "approved"
    ){

      return NextResponse.json({
        received:true
      });

    }




    const externalReference =
      payment.external_reference;



    if(!externalReference){

      console.error(
        "SEM EXTERNAL REFERENCE"
      );


      return NextResponse.json({
        received:true
      });

    }

    if (String(externalReference).startsWith("service:")) {
      const servicePaymentId = String(externalReference).slice(8);
      const { data: servicePayment, error: serviceError } = await supabaseAdmin.from("service_payments").update({ status: "approved", provider_reference: String(payment.id), paid_at: new Date().toISOString() }).eq("id", servicePaymentId).select("id,amount,proposal_id,service_proposals(request_id)").single();
      if (!serviceError && servicePayment) {
        const proposalRelation = Array.isArray(servicePayment.service_proposals) ? servicePayment.service_proposals[0] : servicePayment.service_proposals;
        const requestId = proposalRelation?.request_id;
        if (requestId) await supabaseAdmin.from("service_requests").update({ status: "booked", updated_at: new Date().toISOString() }).eq("id", requestId);
        const { data: job } = await supabaseAdmin.from("service_jobs").select("id,paid_amount").eq("proposal_id",servicePayment.proposal_id).maybeSingle();
        if(job) await supabaseAdmin.from("service_jobs").update({paid_amount:Number(job.paid_amount||0)+Number(servicePayment.amount),updated_at:new Date().toISOString()}).eq("id",job.id);
        const { data: team } = await supabaseAdmin.from("profiles").select("id,role,roles");
        const managers = (team || []).filter(person => allRoles(person).some(role => ["owner","admin","support"].includes(role)));
        await Promise.all(managers.map(person => sendPush(person.id,{title:"Sinal de contratação confirmado 💍",body:`Pagamento de ${Number(servicePayment.amount).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} aprovado.`,href:"/admin/studio"}).catch(()=>undefined)));
      }
      return NextResponse.json({ success: !serviceError });
    }




    // verifica se já tem token

    const {
      data: order
    } =
      await supabaseAdmin
      .from("orders")
      .select("download_token,status,email,name,whatsapp,total,paid_email_sent_at,user_id")
      .eq(
        "id",
        externalReference
      )
      .single();




    let token =
      order?.download_token;



    if(!token){

      token =
        crypto.randomUUID();


    }





    const { error } =
      await supabaseAdmin
      .from("orders")
      .update({

        status:"paid",

        download_token:
          token,

        download_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      })
      .eq(
        "id",
        externalReference
      );





    if(error){

      console.error(
        "UPDATE SUPABASE ERROR:",
        error
      );


    }

    if (!error && order && order.status !== "paid" && !order.paid_email_sent_at) {
      try {
        const result = await sendPurchaseEmail({ to: order.email, name: order.name, orderId: String(externalReference), total: Number(order.total), token, kind: "paid" });
        if (!result.skipped) await supabaseAdmin.from("orders").update({ paid_email_sent_at: new Date().toISOString() }).eq("id", externalReference).is("paid_email_sent_at", null);
      } catch (emailError) { console.error("PAID EMAIL ERROR", emailError); }
    }

    if (!error && order && order.status !== "paid") {
      await sendWhatsApp({ to: order.whatsapp, text: `Pagamento confirmado! Seu pedido #${String(externalReference).slice(0,8).toUpperCase()} está disponível em ${process.env.NEXT_PUBLIC_SITE_URL}/download/${token}` }).catch(whatsappError => console.error("WHATSAPP ERROR", whatsappError));
      if(order.user_id){const notice={title:"Pagamento confirmado 🎉",body:`Seu pedido #${String(externalReference).slice(0,8).toUpperCase()} já está disponível para download.`,href:`/minha-conta/pedido/${externalReference}`};await supabaseAdmin.from("client_notifications").insert({user_id:order.user_id,...notice});await sendPush(order.user_id,notice).catch(pushError=>console.error("PUSH ERROR",pushError))}
      const saleNotice={title:"Nova venda confirmada 💰",body:`${order.name||"Cliente"} · pedido #${String(externalReference).slice(0,8).toUpperCase()} · ${Number(order.total||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`,href:`/admin/orders/${externalReference}`};
      const{data:team}=await supabaseAdmin.from("profiles").select("id,role,roles");const managers=(team||[]).filter(person=>allRoles(person).some(role=>["owner","admin","support"].includes(role)));
      await Promise.all(managers.map(async person=>{await supabaseAdmin.from("team_notifications").insert({user_id:person.id,...saleNotice});return sendPush(person.id,saleNotice).catch(pushError=>console.error("SALE PUSH ERROR",pushError))}));
    }




    console.log(
      "PEDIDO LIBERADO:",
      externalReference
    );


    console.log(
      "TOKEN DOWNLOAD:",
      token
    );





    return NextResponse.json({

      success:true

    });



  } catch(error:any){


    console.error(
      "WEBHOOK ERROR:",
      error
    );


    // MP precisa receber 200
    return NextResponse.json({

      received:true

    });


  }

}
