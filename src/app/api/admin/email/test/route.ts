import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { sendPurchaseEmail } from "@/lib/email";
import { auditAdmin } from "@/lib/audit";
export async function POST() { const user = await getApiUser(); if (!user?.email) return NextResponse.json({ error: "Administrador sem e-mail." }, { status: 400 }); const result = await sendPurchaseEmail({ to: user.email, name: "Matheus", orderId: "7f27f242-demo", total: 105, quantity: 8, discount: 15, couponCode: "EVENTO10", kind: "paid" }); if (result.skipped) return NextResponse.json({ error: "Configure RESEND_API_KEY e EMAIL_FROM na Vercel antes de enviar." }, { status: 503 }); await auditAdmin("send_test", "email", user.email); return NextResponse.json({ success: true, sentTo: user.email }); }
