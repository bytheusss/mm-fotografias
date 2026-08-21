import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
const secret = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "mm-event-access";
export const hashEventPassword = (eventId: string, password: string) => createHmac("sha256", secret()).update(`${eventId}:${password}`).digest("hex");
export const eventCookieName = (eventId: string) => `mm-event-${eventId}`;
export const eventCookieValue = (eventId: string) => createHmac("sha256", secret()).update(`access:${eventId}`).digest("hex");
export async function hasEventAccess(eventId: string) { const value = (await cookies()).get(eventCookieName(eventId))?.value || ""; const expected = eventCookieValue(eventId); return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected)); }
