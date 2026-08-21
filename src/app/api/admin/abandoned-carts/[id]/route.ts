import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { status, recoverySent } = await request.json();
  if (status && !["open", "recovered", "dismissed"].includes(status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) values.status = status; if (recoverySent) values.recovery_sent_at = new Date().toISOString();
  const { error } = await supabaseAdmin.from("abandoned_carts").update(values).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
