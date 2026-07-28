import { NextResponse } from "next/server";

import {
  MercadoPagoConfig,
  Order,
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



    const {
      name,
      email,
      whatsapp,
      items,
      total,

    } = body;





    if (
      !email ||
      !items ||
      !total

    ) {


      return NextResponse.json(

        {
          error:
            "Dados incompletos",
        },

        {
          status:400,
        }

      );

    }





    const order =
      new Order(client);





    const response =
      await order.create({

        body:{


          type:
            "online",



          processing_mode:
            "automatic",




          total_amount:
            Number(total).toFixed(2),





          payer:{


            email,

            first_name:
              name ||
              "Cliente",


          },





          transactions:{


            payments:[{


              amount:
                Number(total).toFixed(2),




              payment_method:{


                id:
                  "pix",


                type:
                  "bank_transfer",


              },


            }],


          },





          external_reference:

            `MM-${Date.now()}-${whatsapp || ""}`,



        },


      });







    const payment =

      response.transactions
        ?.payments?.[0];







    console.log(

      "ORDER RESPONSE:",

      JSON.stringify(
        response,
        null,
        2
      )

    );







    const { error } =

      await supabaseAdmin

        .from("orders")

        .insert({


          name,

          email,

          whatsapp,


          photos:
            items,


          total:


            Number(total),




          mercado_pago_order_id:

            response.id,



          mercado_pago_payment_id:

            payment?.id,



          status:

            "pending",



        });






    if(error){


      console.error(

        "SUPABASE ERROR:",

        error

      );


    }








    return NextResponse.json({


      success:true,


      order_id:
        response.id,



      status:
        response.status,



      payment_id:
        payment?.id,



      payment,



    });







  } catch(error:any){



    console.error(

      "Mercado Pago Error:",

      JSON.stringify(
        error,
        null,
        2
      )

    );




    return NextResponse.json(


      {

        error:

          error.message ||

          "Erro ao criar pagamento"


      },


      {

        status:500,

      }


    );


  }


}