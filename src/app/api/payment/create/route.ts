import { NextResponse } from "next/server";

import {
  MercadoPagoConfig,
  Payment,
} from "mercadopago";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getApiUser } from "@/lib/api-auth";
import { sendPurchaseEmail } from "@/lib/email";


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
    } = body;


    if (
      !email ||
      !Array.isArray(items) || items.length === 0
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



    if (items.length > 100 || !items.every((item: unknown) => item && typeof item === "object" && "id" in item)) {
      return NextResponse.json({ error: "Itens inválidos" }, { status: 400 });
    }

    const user = await getApiUser();
    const normalizedEmail = String(email).trim().toLowerCase();
    if (user?.email && user.email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Use o e-mail da sua conta ou saia para comprar como visitante." }, { status: 400 });
    }
    // O servidor calcula o preço; nunca confia no total enviado pelo navegador.
    const pricePerPhoto = items.length >= 5 ? 12 : 15;
    const total = items.length * pricePerPhoto;

    const {
      data: orderDB,
      error: dbError

    } = await supabaseAdmin
      .from("orders")
      .insert({

        name,

        email: normalizedEmail,

        whatsapp,

        photos: items,

        total,

        status:"pending",

        user_id: user?.id || null

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

            email: normalizedEmail,

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

    await sendPurchaseEmail({ to: normalizedEmail, name, orderId: String(orderDB.id), total, kind: "created" })
      .catch((emailError) => console.error("ORDER EMAIL ERROR", emailError));





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
