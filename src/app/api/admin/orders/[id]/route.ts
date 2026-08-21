import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPurchaseEmail } from "@/lib/email";

async function updateOrder(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { status, generateToken, downloadAction, adminNotes, refundStatus } = await request.json();
  if (status && !["paid", "pending", "cancelled"].includes(status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  if (refundStatus && !["none", "requested", "processing", "refunded", "rejected"].includes(refundStatus)) return NextResponse.json({ error: "Status de estorno inválido" }, { status: 400 });
  if (downloadAction && !["revoke", "restore", "extend"].includes(downloadAction)) return NextResponse.json({ error: "Ação de download inválida" }, { status: 400 });
  if (!status && !generateToken && !downloadAction && adminNotes === undefined && !refundStatus) return NextResponse.json({ error: "Nenhuma alteração informada" }, { status: 400 });
  const { id } = await params;
  const values: Record<string, unknown> = {};
  if (status) values.status = status;
  if (adminNotes !== undefined) values.admin_notes = String(adminNotes).trim().slice(0, 4000) || null;
  if (refundStatus) values.refund_status = refundStatus;
  if (downloadAction === "revoke") values.download_revoked_at = new Date().toISOString();
  if (downloadAction === "restore") values.download_revoked_at = null;
  if (downloadAction === "extend") { values.download_revoked_at = null; values.download_expires_at = new Date(Date.now() + 30 * 86400000).toISOString(); }
  let orderForEmail: { email: string; name?: string; total: number; status: string; paid_email_sent_at?: string | null } | null = null;
  if (status === "paid" || generateToken) {
    const { data } = await supabaseAdmin.from("orders").select("download_token,email,name,total,status,paid_email_sent_at").eq("id", id).maybeSingle();
    values.download_token = data?.download_token || crypto.randomUUID();
    orderForEmail = data;
  }
  const { error } = await supabaseAdmin.from("orders").update(values).eq("id", id);
  if (!error && status === "paid" && orderForEmail && orderForEmail.status !== "paid" && !orderForEmail.paid_email_sent_at) {
    const result = await sendPurchaseEmail({ to: orderForEmail.email, name: orderForEmail.name, orderId: id, total: Number(orderForEmail.total), token: String(values.download_token || ""), kind: "paid" }).catch(() => ({ skipped: true }));
    if (!result.skipped) await supabaseAdmin.from("orders").update({ paid_email_sent_at: new Date().toISOString() }).eq("id", id).is("paid_email_sent_at", null);
  }
  return error ? NextResponse.json({ error: "Falha ao atualizar" }, { status: 500 }) : NextResponse.json({ success: true });
}

export const PATCH = updateOrder;
export const PUT = updateOrder;
