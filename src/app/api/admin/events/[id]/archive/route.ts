import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auditAdmin } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isApiAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const { archived } = await request.json();
  const { id } = await params;
  const { error } = await supabaseAdmin.from("events").update({ archived: Boolean(archived), published: archived ? false : undefined }).eq("id", id);
  if (error) return NextResponse.json({ error: "Falha ao atualizar evento" }, { status: 500 });
  await auditAdmin(archived ? "archive" : "unarchive", "event", id);
  return NextResponse.json({ success: true });
}
