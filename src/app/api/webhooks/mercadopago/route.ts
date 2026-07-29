import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "WEBHOOK MERCADO PAGO:",
      JSON.stringify(body, null, 2)
    );

    // Aceita apenas eventos de Order
    if (body.type !== "order") {
      return NextResponse.json({ received: true });
    }

    const order = body.data;

    const externalReference = order.external_reference;
    const status = order.status;
    const orderId = order.id;

    console.log("ORDER:", orderId);
    console.log("STATUS:", status);
    console.log("EXTERNAL_REFERENCE:", externalReference);

    if (!externalReference) {
      console.log("Order sem external_reference.");
      return NextResponse.json({ received: true });
    }

    switch (status) {
      case "action_required":
        console.log("PIX aguardando pagamento.");
        break;

      case "processed":
        await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
          })
          .eq("id", externalReference);

        console.log("Pedido marcado como PAGO.");
        break;

      case "cancelled":
        await supabaseAdmin
          .from("orders")
          .update({
            status: "cancelled",
          })
          .eq("id", externalReference);

        console.log("Pedido CANCELADO.");
        break;

      default:
        console.log("Status recebido:", status);
    }

    return NextResponse.json({
      received: true,
    });

  } catch (error: any) {

    console.error(
      "WEBHOOK ERROR:",
      error
    );

    // Sempre responde 200 ao Mercado Pago
    return NextResponse.json({
      received: true,
      error: error.message,
    });
  }
}