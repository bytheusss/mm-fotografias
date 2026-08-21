import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isApiAdmin())) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  const { archived } = await request.json();
  const { id } = await params;
  const { error } = await supabaseAdmin.from("events").update({ archived: Boolean(archived), published: archived ? false : undefined }).eq("id", id);
  return error ? NextResponse.json({ error: "Falha ao atualizar evento" }, { status: 500 }) : NextResponse.json({ success: true });
}
