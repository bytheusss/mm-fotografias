import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const kind = String(body?.kind || "");
  if (!body?.photoId || !body?.eventId || !["view", "favorite", "cart"].includes(kind)) return NextResponse.json({ error: "Interação inválida." }, { status: 400 });
  const sessionKey = String(body.sessionKey || "").slice(0, 100) || null;
  if (kind === "view" && sessionKey) {
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data } = await supabaseAdmin.from("photo_interactions").select("id").eq("photo_id", body.photoId).eq("kind", kind).eq("session_key", sessionKey).gte("created_at", since).limit(1);
    if (data?.length) return NextResponse.json({ success: true, deduplicated: true });
  }
  const { error } = await supabaseAdmin.from("photo_interactions").insert({ photo_id: body.photoId, event_id: body.eventId, kind, session_key: sessionKey });
  return error ? NextResponse.json({ error: "Não foi possível registrar." }, { status: 500 }) : NextResponse.json({ success: true });
}
