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

      return NextResponse.json(
        {
          received: true,
        },
        {
          status: 200,
        }
      );

    }


    const paymentApi =
      new Payment(client);


    const payment =
      await paymentApi.get({

        id: Number(paymentId),

      });


    console.log(
      "STATUS PAGAMENTO:",
      payment.status
    );


    const { error } =
      await supabaseAdmin
        .from("orders")
        .update({

          status:
            payment.status,

        })
        .eq(

          "mercado_pago_payment_id",

          String(payment.id)

        );


    if (error) {

      console.error(
        "ERRO UPDATE SUPABASE:",
        error
      );

    } else {

      console.log(
        "ORDER ATUALIZADA COM SUCESSO"
      );

    }


    return NextResponse.json({

      success: true,

    });


  } catch(error:any) {


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

        status: 500,

      }

    );

  }

}import { NextResponse } from "next/server";

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

      return NextResponse.json(
        {
          received: true,
        },
        {
          status: 200,
        }
      );

    }


    const paymentApi =
      new Payment(client);


    const payment =
      await paymentApi.get({

        id: Number(paymentId),

      });


    console.log(
      "STATUS PAGAMENTO:",
      payment.status
    );


    const { error } =
      await supabaseAdmin
        .from("orders")
        .update({

          status:
            payment.status,

        })
        .eq(

          "mercado_pago_payment_id",

          String(payment.id)

        );


    if (error) {

      console.error(
        "ERRO UPDATE SUPABASE:",
        error
      );

    } else {

      console.log(
        "ORDER ATUALIZADA COM SUCESSO"
      );

    }


    return NextResponse.json({

      success: true,

    });


  } catch(error:any) {


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

        status: 500,

      }

    );

  }

}