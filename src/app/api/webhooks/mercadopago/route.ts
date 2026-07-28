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
      JSON.stringify(
        body,
        null,
        2
      )
    );




    const paymentId =
      body?.data?.id;





    if (!paymentId) {


      return NextResponse.json({

        received:true,

      });


    }






    const paymentApi =
      new Payment(client);




    const payment =
      await paymentApi.get({

        id:
          paymentId,

      });





    console.log(
      "STATUS PAGAMENTO:",
      payment.status
    );







    if (
      payment.status === "approved"
    ) {



      const { error } =

        await supabaseAdmin

          .from("orders")

          .update({

            status:
              "paid",

          })

          .eq(

            "mercado_pago_payment_id",

            payment.id

          );






      if(error){


        console.error(

          "ERRO UPDATE SUPABASE:",

          error

        );


      }



    }






    return NextResponse.json({

      success:true,

    });






  } catch(error:any){


    console.error(

      "WEBHOOK ERROR:",

      error

    );



    return NextResponse.json(

      {

        error:
          error.message,

      },

      {

        status:500,

      }

    );


  }


}