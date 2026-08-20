import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const { data: order } = await supabaseAdmin.from("orders").select("id,email,user_id,status,total,photos,download_token,created_at").eq("id", id).maybeSingle();
  if (!order || (order.user_id !== user.id && (order.user_id || order.email?.toLowerCase() !== user.email?.toLowerCase()))) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  return NextResponse.json({ order }, { headers: { "Cache-Control": "private, no-store" } });
}
