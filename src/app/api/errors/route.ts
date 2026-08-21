import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const event = { message: String(body.message || "Erro no cliente").slice(0, 500), path: String(body.path || "").slice(0, 300), timestamp: new Date().toISOString() };
  console.error("CLIENT ERROR", event);
  if (process.env.ERROR_WEBHOOK_URL) await fetch(process.env.ERROR_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event) }).catch(() => undefined);
  return NextResponse.json({ received: true });
}
