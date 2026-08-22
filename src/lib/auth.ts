import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { allRoles, hasRole } from "@/lib/roles";

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser(next = "/minha-conta") {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role,roles").eq("id", user.id).maybeSingle();
  if (!hasRole(data, ["owner", "admin"])) redirect("/");
  return user;
}

export async function requireStaff() { const user = await requireUser("/fotografo"); const supabase = await createClient(); const { data } = await supabase.from("profiles").select("role,roles").eq("id", user.id).maybeSingle(); if (!hasRole(data, ["owner", "admin", "photographer"])) redirect("/"); return { user, role: data?.role as "owner" | "admin" | "photographer", roles: allRoles(data) }; }
