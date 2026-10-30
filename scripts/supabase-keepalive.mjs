import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !serviceKey) {
  console.error("Faltam as variáveis locais do Supabase.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

try {
  const checkedAt = new Date();
  const [{ data: events, error: eventsError }, { count: photosCount, error: photosError }] = await Promise.all([
    supabase.from("events").select("id").limit(1),
    supabase.from("photos").select("id", { count: "exact", head: true }),
  ]);
  if (eventsError) throw eventsError;
  if (photosError) throw photosError;

  const { data: latest, error: latestError } = await supabase
    .from("admin_audit_logs")
    .select("created_at")
    .eq("action", "supabase_keepalive")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw latestError;

  const lastHeartbeat = latest?.created_at ? new Date(latest.created_at) : null;
  const markerIsFresh = lastHeartbeat && checkedAt.getTime() - lastHeartbeat.getTime() < 36 * 60 * 60 * 1000;
  if (!markerIsFresh) {
    const { error: writeError } = await supabase.from("admin_audit_logs").insert({
      admin_user_id: null,
      action: "supabase_keepalive",
      entity_type: "system",
      details: {
        source: "codex-three-day-monitor",
        checkedAt: checkedAt.toISOString(),
      },
    });
    if (writeError) throw writeError;
  }

  console.log(JSON.stringify({
    ok: true,
    database: "online",
    eventsResponded: Boolean(events),
    photos: photosCount ?? null,
    markerInserted: !markerIsFresh,
    previousMarkerAt: lastHeartbeat?.toISOString() ?? null,
    checkedAt: checkedAt.toISOString(),
  }));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    status: error?.status ?? error?.statusCode ?? null,
    code: error?.code ?? null,
    error: error instanceof Error ? error.message : String(error),
  }));
  process.exitCode = 1;
}
