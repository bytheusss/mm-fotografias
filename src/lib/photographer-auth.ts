import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { allRoles, hasRole } from "@/lib/roles";

export async function getStaffUser() { const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return null; const { data: profile } = await supabase.from("profiles").select("role,roles").eq("id", auth.user.id).maybeSingle(); return hasRole(profile, ["owner", "admin", "photographer"]) ? { user: auth.user, role: profile!.role, roles: allRoles(profile) } : null; }
export async function canUploadEvent(eventId: string) { const staff = await getStaffUser(); if (!staff) return false; if (staff.roles.some(role => ["owner", "admin"].includes(role))) return true; const { data } = await supabaseAdmin.from("event_photographers").select("can_upload").eq("event_id", eventId).eq("photographer_id", staff.user.id).maybeSingle(); return Boolean(data?.can_upload); }
