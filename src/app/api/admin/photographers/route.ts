import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,commission_rate")
    .contains("roles", ["photographer"])
    .order("full_name");

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ photographers: data || [] });
}
