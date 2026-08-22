import { NextResponse } from "next/server";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "client-error"), 20, 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ received: false }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const body = await request.json().catch(() => ({}));
  const event = { message: String(body.message || "Erro no cliente").slice(0, 500), path: String(body.path || "").slice(0, 300), timestamp: new Date().toISOString() };
  console.error("CLIENT ERROR", event);
  try { await supabaseAdmin.from("client_error_logs").insert({ message: event.message, path: event.path }); } catch { /* banco ainda pode estar aguardando a migração */ }
  if (process.env.ERROR_WEBHOOK_URL) {
    const discord = process.env.ERROR_WEBHOOK_URL.includes("discord.com/api/webhooks");
    await fetch(process.env.ERROR_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(discord ? { content: `🚨 **Erro M&M Fotografias**\n${event.message}\n${event.path}\n${event.timestamp}` } : event) }).catch(() => undefined);
  }
  return NextResponse.json({ received: true });
}
