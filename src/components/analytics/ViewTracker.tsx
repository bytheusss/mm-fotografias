"use client";
import { useEffect } from "react";
import { analyticsAllowed } from "@/lib/privacy-consent";
export function ViewTracker({ eventId, photoId }: { eventId?: string; photoId?: string }) {
  useEffect(() => { const id = eventId || photoId; if (!id) return; const track = () => { if (!analyticsAllowed()) return; const key = `mm-view-${eventId ? "event" : "photo"}-${id}`; if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); void fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, photoId }), keepalive: true }); }; track(); window.addEventListener("mm-cookie-consent", track); return () => window.removeEventListener("mm-cookie-consent", track); }, [eventId, photoId]);
  return null;
}
