import "server-only";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function isOwner() { const user = await getApiUser(); if (!user) return false; const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).maybeSingle(); return data?.role === "owner"; }
