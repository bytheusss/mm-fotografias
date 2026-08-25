import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function configured() {
  const subject = process.env.VAPID_SUBJECT || "mailto:eigenheermatheus@gmail.com";
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendPush(userId: string, payload: { title: string; body?: string; href?: string | null }) {
  if (!configured()) return { sent: 0, failed: 0, subscriptions: 0, configured: false, reason: "missing_credentials" };
  const { data, error: selectError } = await supabaseAdmin.from("push_subscriptions").select("id,endpoint,p256dh,auth").eq("user_id", userId);
  if (selectError) {
    console.error("PUSH SUBSCRIPTIONS ERROR", selectError.message);
    return { sent: 0, failed: 0, subscriptions: 0, configured: true, reason: "database_error" };
  }
  let sent = 0;
  let failed = 0;
  let reason: string | undefined;
  for (const row of data || []) {
    try {
      await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, JSON.stringify(payload));
      sent += 1;
      await supabaseAdmin.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", row.id);
    } catch (error) {
      failed += 1;
      const pushError = error as { statusCode?: number; message?: string };
      const status = pushError.statusCode;
      console.error("PUSH DELIVERY ERROR", { status, message: pushError.message });
      if (status === 401 || status === 403) reason = "invalid_vapid_pair";
      else if (status === 404 || status === 410) reason ||= "expired_subscription";
      else reason ||= "delivery_failed";
      if (status === 401 || status === 403 || status === 404 || status === 410) await supabaseAdmin.from("push_subscriptions").delete().eq("id", row.id);
    }
  }
  return { sent, failed, subscriptions: data?.length || 0, configured: true, reason };
}
