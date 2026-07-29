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
          error:"Dados incompletos"
        },
        {
          status:400
        }
      );

    }



    // SALVA PEDIDO

    const {
      data: orderDB,
      error: dbError

    } = await supabaseAdmin
      .from("orders")
      .insert({

        name,

        email,

        whatsapp,

        photos: items,

        total,

        status:"pending"

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



    console.log(
      "PEDIDO SALVO:",
      orderDB.id
    );




    // CRIA PAGAMENTO PIX

    const paymentApi =
      new Payment(client);



    const payment =
      await paymentApi.create({

        body:{

          transaction_amount:
            Number(total),


          description:
            "Compra de fotos M&M Fotografias",


          payment_method_id:
            "pix",


          payer:{

            email,

            first_name:
              name || "Cliente"

          },


          external_reference:
            String(orderDB.id)

        }

      });





    console.log(
      "PAYMENT RESPONSE:",
      payment
    );





    // SALVA DADOS MP


    await supabaseAdmin
      .from("orders")
      .update({

        mercado_pago_payment_id:
          String(payment.id),

        status:
          payment.status || "pending"

      })
      .eq(
        "id",
        orderDB.id
      );





    return NextResponse.json({

      success:true,

      payment_id:
        payment.id,


      status:
        payment.status,


      qr_code:
        payment.point_of_interaction
        ?.transaction_data
        ?.qr_code,


      qr_code_base64:
        payment.point_of_interaction
        ?.transaction_data
        ?.qr_code_base64


    });



  } catch(error:any){


    console.error(
      "PAYMENT ERROR:"
    );


    console.dir(
      error,
      {
        depth:null
      }
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