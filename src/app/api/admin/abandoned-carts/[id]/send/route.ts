import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendRecoveryEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { data: cart } = await supabaseAdmin.from("abandoned_carts").select("email,name,whatsapp,quantity,status").eq("id", id).maybeSingle();
  if (!cart || cart.status !== "open") return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 404 });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mm-fotografias.vercel.app";
  const [email, whatsapp] = await Promise.all([sendRecoveryEmail({ to: cart.email, name: cart.name, quantity: cart.quantity }).catch(error => ({ error: error instanceof Error ? error.message : "Falha no e-mail" })), sendWhatsApp({ to: cart.whatsapp, text: `Olá, ${cart.name || "cliente"}! Suas ${cart.quantity} fotos continuam no carrinho da M&M Fotografias: ${siteUrl}/carrinho` }).catch(error => ({ error: error instanceof Error ? error.message : "Falha no WhatsApp" }))]);
  const sent = !("skipped" in email && email.skipped) || !("skipped" in whatsapp && whatsapp.skipped);
  if (sent) await supabaseAdmin.from("abandoned_carts").update({ recovery_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ sent, email, whatsapp }, { status: sent ? 200 : 409 });
}
