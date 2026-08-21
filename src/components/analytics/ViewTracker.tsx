"use client";
import { useEffect } from "react";
export function ViewTracker({ eventId, photoId }: { eventId?: string; photoId?: string }) {
  useEffect(() => { const id = eventId || photoId; if (!id) return; const key = `mm-view-${eventId ? "event" : "photo"}-${id}`; if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); void fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, photoId }), keepalive: true }); }, [eventId, photoId]);
  return null;
}
