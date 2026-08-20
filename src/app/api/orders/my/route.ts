import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {

  const email =
    req.nextUrl.searchParams.get("email");


  if (!email) {

    return NextResponse.json(
      {
        error:"Email não informado"
      },
      {
        status:400
      }
    );

  }


  const { data: orders, error } =
    await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("email", email)
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


  return NextResponse.json({
    orders: orders || []
  });

}