import { NextResponse } from "next/server";
import { checkOriginalExists } from "@/lib/original-storage";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Acesso negado." }, { status: 401 });

  const now = Date.now();
  const ninetyDaysAgo = new Date(now - 90 * 86_400_000).toISOString();
  const oneYearAgo = new Date(now - 365 * 86_400_000).toISOString();

  const { data: heartbeat, error: heartbeatError } = await supabaseAdmin
    .from("events")
    .select("id")
    .limit(1);
  if (heartbeatError) {
    return NextResponse.json({ ok: false, database: heartbeatError.message }, { status: 503 });
  }

  const fullAudit = new URL(request.url).searchParams.get("full") === "1";
  const { count: originalCount, error: countError } = await supabaseAdmin
    .from("photos")
    .select("id", { count: "exact", head: true })
    .like("original_path", "b2/%");
  if (countError) return NextResponse.json({ ok: false, database: countError.message }, { status: 503 });
  const batchSize = fullAudit ? Math.max(1, originalCount || 1) : 12;
  const dailyOffset = originalCount ? (Math.floor(now / 86_400_000) * 12) % originalCount : 0;
  const from = fullAudit ? 0 : dailyOffset;
  const to = fullAudit ? batchSize - 1 : Math.min(from + batchSize - 1, Math.max(0, (originalCount || 1) - 1));
  const { data: sample, error: sampleError } = await supabaseAdmin
    .from("photos")
    .select("id,original_path")
    .like("original_path", "b2/%")
    .order("id")
    .range(from, to);
  if (sampleError) return NextResponse.json({ ok: false, database: sampleError.message }, { status: 503 });

  const checks: Array<{ id: string; valid: boolean }> = [];
  for (let index = 0; index < (sample || []).length; index += 20) {
    const group = (sample || []).slice(index, index + 20);
    checks.push(...await Promise.all(group.map(async (photo) => ({
      id: photo.id,
      valid: await checkOriginalExists(String(photo.original_path)),
    }))));
  }
  const invalid = checks.filter((check) => !check.valid).map((check) => check.id);

  const { error: heartbeatWriteError } = await supabaseAdmin.from("admin_audit_logs").insert({
    admin_user_id: null,
    action: "supabase_keepalive",
    entity_type: "system",
    details: {
      checkedOriginals: checks.length,
      invalidOriginals: invalid.length,
      checkedAt: new Date().toISOString(),
    },
  });
  if (heartbeatWriteError) {
    return NextResponse.json({ ok: false, database: heartbeatWriteError.message }, { status: 503 });
  }

  const [errorsCleanup, auditCleanup, notificationCleanup] = await Promise.all([
    supabaseAdmin.from("client_error_logs").delete().eq("resolved", true).lt("created_at", ninetyDaysAgo),
    supabaseAdmin.from("admin_audit_logs").delete().lt("created_at", oneYearAgo),
    supabaseAdmin.from("client_notifications").delete().not("read_at", "is", null).lt("created_at", ninetyDaysAgo),
  ]);
  const maintenanceErrors = [errorsCleanup.error, auditCleanup.error, notificationCleanup.error]
    .filter(Boolean)
    .map((error) => error?.message);

  return NextResponse.json({
    ok: invalid.length === 0 && maintenanceErrors.length === 0,
    database: "online",
    heartbeatRows: heartbeat?.length || 0,
    backblaze: { total: originalCount || 0, checked: checks.length, fullAudit, invalid },
    maintenanceErrors,
    checkedAt: new Date().toISOString(),
  }, { status: invalid.length || maintenanceErrors.length ? 503 : 200 });
}
