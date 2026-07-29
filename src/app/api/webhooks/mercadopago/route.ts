import { NextResponse } from "next/server";

import {
  MercadoPagoConfig,
  Payment,
} from "mercadopago";

import { supabaseAdmin } from "@/lib/supabaseAdmin";


const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});


export async function POST(
  request: Request
) {

  try {

    const body = await request.json();


    console.log(
      "WEBHOOK MERCADO PAGO:",
      JSON.stringify(body, null, 2)
    );


    // ignora eventos que não são pagamento
    if (
      body.type !== "payment"
    ) {

      return NextResponse.json({
        received: true,
      });

    }


    const paymentId =
      body?.data?.id;


    if (!paymentId) {

      return NextResponse.json({
        received: true,
      });

    }


    const paymentApi =
      new Payment(client);

      console.log(
        "BUSCANDO PAGAMENTO:",
        paymentId
      );
      
      console.log(
        "TOKEN MP:",
        process.env.MERCADO_PAGO_ACCESS_TOKEN?.slice(0,15)
      );
    const payment =
      await paymentApi.get({
        id: paymentId,
      });


    console.log(
      "PAGAMENTO ENCONTRADO:",
      payment.id
    );


    console.log(
      "STATUS:",
      payment.status
    );


    if (
      payment.status === "approved"
    ) {


      const { error } =
        await supabaseAdmin
          .from("orders")
          .update({

            status: "paid",

          })
          .eq(

            "mercado_pago_payment_id",
            String(payment.id)

          );


      if(error){

        console.error(
          "ERRO UPDATE SUPABASE:",
          error
        );

      }


      console.log(
        "PEDIDO ATUALIZADO COMO PAGO"
      );


    }


    return NextResponse.json({

      success:true,

    });



  } catch(error:any){


    console.error(
      "WEBHOOK ERROR:",
      error
    );


    // MP precisa receber 200 para não ficar reenviando infinitamente

    return NextResponse.json({

      received:true,

      error:error.message

    });


  }

}