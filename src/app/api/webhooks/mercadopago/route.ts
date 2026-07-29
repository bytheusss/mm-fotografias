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

    const body =
      await request.json();


    console.log(
      "WEBHOOK:",
      JSON.stringify(body,null,2)
    );


    let paymentId =
      null;


    if(body.type === "payment") {

      paymentId =
        body.data?.id;

    }


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
      "PAYMENT STATUS:",
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



    const token =
      crypto.randomUUID();



    const { error } =
      await supabaseAdmin
      .from("orders")
      .update({

        status:"paid",

        download_token:
          token

      })
      .eq(
        "id",
        externalReference
      );



    if(error){

      console.error(
        "UPDATE ERROR:",
        error
      );

    }



    console.log(
      "PEDIDO LIBERADO:",
      externalReference
    );


    console.log(
      "TOKEN:",
      token
    );



    return NextResponse.json({
      success:true
    });



  } catch(error){

    console.error(
      "WEBHOOK ERROR:",
      error
    );


    return NextResponse.json({
      received:true
    });

  }

}