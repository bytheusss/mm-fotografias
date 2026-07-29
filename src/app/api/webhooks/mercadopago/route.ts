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




    // verifica se já tem token

    const {
      data: order
    } =
      await supabaseAdmin
      .from("orders")
      .select(
        "download_token"
      )
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
          token

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