import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getApiUser } from "@/lib/api-auth";

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });


  const { data: orders, error } =
    await supabaseAdmin
      .from("orders")
      .select("id,status,total,photos,download_token,created_at,user_id")
      .or(`user_id.eq.${user.id}${user.email ? `,and(user_id.is.null,email.ilike.${user.email.toLowerCase()})` : ""}`)
      .order(
        "created_at",
        {
          ascending:false
        }
      );


  if(error){

    return NextResponse.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );

  }


  return NextResponse.json({ orders: orders || [] }, { headers: { "Cache-Control": "private, no-store" } });

}
