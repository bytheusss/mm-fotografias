import { NextResponse } from "next/server";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "views"), 60, 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ counted: false }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const eventId = typeof body.eventId === "string" ? body.eventId : null;
  const photoId = typeof body.photoId === "string" ? body.photoId : null;
  const id = eventId || photoId;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ counted: false }, { status: 400 });
  const { error } = await supabaseAdmin.rpc(eventId ? "increment_event_view" : "increment_photo_view", { target_id: id });
  return NextResponse.json({ counted: !error });
}
