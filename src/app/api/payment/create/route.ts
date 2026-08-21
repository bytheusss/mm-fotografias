import { NextResponse } from "next/server";

import {
  MercadoPagoConfig,
  Payment,
} from "mercadopago";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getApiUser } from "@/lib/api-auth";
import { sendPurchaseEmail } from "@/lib/email";
import { calculatePrice } from "@/lib/pricing";
import { applyCoupon } from "@/lib/coupons";


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
      couponCode,
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
    const pricing = calculatePrice(items.length);
    const coupon = await applyCoupon(couponCode, pricing.total);
    const total = coupon.total;

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

        coupon_code: coupon.code,

        discount_amount: coupon.discount,

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

    if (coupon.code) {
      const { data: currentCoupon } = await supabaseAdmin.from("coupons").select("uses").eq("code", coupon.code).maybeSingle();
      if (currentCoupon) await supabaseAdmin.from("coupons").update({ uses: Number(currentCoupon.uses || 0) + 1 }).eq("code", coupon.code);
    }

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
