import "server-only";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hasRole } from "@/lib/roles";
export async function isOwner() { const user = await getApiUser(); if (!user) return false; const { data } = await supabaseAdmin.from("profiles").select("role,roles").eq("id", user.id).maybeSingle(); return hasRole(data, ["owner"]); }
