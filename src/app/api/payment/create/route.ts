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
      console.error("SUPABASE ERROR:");
      console.dir(dbError, { depth: null });
      throw dbError;
    }

    console.log("PEDIDO SALVO:", orderDB.id);

    // ===========================
    // Mercado Pago
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

    console.log("===== ORDER RESPONSE =====");
    console.dir(response, { depth: null });

    const payment =
      response.transactions?.payments?.[0];

    // ===========================
    // Atualiza Supabase
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
      console.error("ERRO UPDATE SUPABASE:");
      console.dir(updateError, { depth: null });
    }

    return NextResponse.json({
      success: true,
      order_id: response.id,
      payment_id: payment?.id,
      payment,
    });

  } catch (error: any) {

    console.error("======================================");
    console.error("=========== PAYMENT ERROR ============");
    console.error("======================================");

    console.dir(error, { depth: null });

    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.status);
    console.log("NAME:", error?.name);

    console.log("CAUSE:");
    console.dir(error?.cause, { depth: null });

    console.log("DETAILS:");
    console.dir(error?.details, { depth: null });

    console.log("ERRORS:");
    console.dir(error?.errors, { depth: null });

    console.log("DATA:");
    console.dir(error?.data, { depth: null });

    console.log("RAW:");
    console.log(JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: error?.message || "Erro ao criar pagamento",
      },
      {
        status: 500,
      }
    );
  }
}