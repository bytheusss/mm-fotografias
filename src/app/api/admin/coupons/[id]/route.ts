import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isApiAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const { id } = await params;
  const { active } = await request.json();
  const { error } = await supabaseAdmin.from("coupons").update({ active: Boolean(active) }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
