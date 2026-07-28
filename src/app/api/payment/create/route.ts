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



    if(
      !email ||
      !items ||
      !total
    ){

      return NextResponse.json(
        {
          error:"Dados incompletos"
        },
        {
          status:400
        }
      );

    }



    // 1 - cria pedido no Supabase

    const {
      data: orderDB,
      error: dbError

    } = await supabaseAdmin
      .from("orders")
      .insert({

        name,

        email,

        whatsapp,

        photos:
          items,

        total,

        status:
          "pending"

      })
      .select()
      .single();



    if(dbError){

      console.error(
        "SUPABASE ERROR:",
        dbError
      );


      throw dbError;

    }




    // 2 - cria PIX Mercado Pago


    const order =
      new Order(client);



    const response =
      await order.create({

        body:{


          type:"online",


          processing_mode:
            "automatic",



          total_amount:
            Number(total)
              .toFixed(2),



          payer:{

            email,

            first_name:
              name ||
              "Cliente"

          },



          transactions:{

            payments:[

              {

                amount:
                  Number(total)
                  .toFixed(2),


                payment_method:{

                  id:"pix",

                  type:
                    "bank_transfer"

                }

              }

            ]

          },


          external_reference:
            orderDB.id


        }

      });





    const payment =
      response
      .transactions
      ?.payments?.[0];





    // 3 - atualiza pedido com dados MP


    await supabaseAdmin
      .from("orders")
      .update({

        mercado_pago_order_id:
          response.id,


        mercado_pago_payment_id:
          payment?.id


      })
      .eq(
        "id",
        orderDB.id
      );






    console.log(
      "PEDIDO SALVO:",
      orderDB.id
    );



    return NextResponse.json({

      success:true,


      order_id:
        response.id,


      payment_id:
        payment?.id,


      payment


    });




  } catch(error:any){


    console.error(
      "PAYMENT ERROR:",
      error
    );



    return NextResponse.json(

      {
        error:
          error.message ||
          "Erro ao criar pagamento"
      },

      {
        status:500
      }

    );


  }

}