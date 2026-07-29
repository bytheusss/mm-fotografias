import { NextResponse } from "next/server";
import {
  MercadoPagoConfig,
  Order,
} from "mercadopago";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      whatsapp,
      items,
      total,
    } = body;

    if (!email || !items || !total) {
      return NextResponse.json(
        {
          error: "Dados incompletos",
        },
        {
          status: 400,
        }
      );
    }

    // ===========================
    // Salva pedido no Supabase
    // ===========================

    const {
      data: orderDB,
      error: dbError,
    } = await supabaseAdmin
      .from("orders")
      .insert({
        name,
        email,
        whatsapp,
        photos: items,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("SUPABASE ERROR:", dbError);
      throw dbError;
    }

    console.log("PEDIDO SALVO:", orderDB.id);

    // ===========================
    // Cria pedido Mercado Pago
    // ===========================

    const order = new Order(client);

    const response = await order.create({
      body: {
        type: "online",

        processing_mode: "automatic",

        total_amount: Number(total).toFixed(2),

        payer: {
          email,
          first_name: name || "Cliente",
        },

        transactions: {
          payments: [
            {
              amount: Number(total).toFixed(2),

              payment_method: {
                id: "pix",
                type: "bank_transfer",
              },
            },
          ],
        },

        external_reference: String(orderDB.id),
      },
    });

    console.log("ORDER RESPONSE:", response);

    const payment =
      response.transactions?.payments?.[0];

    // ===========================
    // Atualiza pedido
    // ===========================

    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          mercado_pago_order_id: String(response.id),
          mercado_pago_payment_id: String(payment?.id),
        })
        .eq("id", orderDB.id);

    if (updateError) {
      console.error(
        "ERRO UPDATE SUPABASE:",
        updateError
      );
    }

    // ===========================
    // LOGS
    // ===========================

    console.log("ORDER ID:", response.id);
    console.log("PAYMENT ID:", payment?.id);
    console.log("STATUS:", payment?.status);
    console.log(
      "EXTERNAL REFERENCE:",
      orderDB.id
    );

    return NextResponse.json({
      success: true,

      order_id: response.id,

      payment_id: payment?.id,

      payment,
    });
  } catch (error: any) {
    console.error("PAYMENT ERROR:", error);

    if (error?.cause) {
      console.error("CAUSE:", error.cause);
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Erro ao criar pagamento",
      },
      {
        status: 500,
      }
    );
  }
}