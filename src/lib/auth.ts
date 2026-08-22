import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") redirect("/");
  return user;
}

export async function requireStaff() { const user = await requireUser("/fotografo"); const supabase = await createClient(); const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(); if (!data || !["admin", "photographer"].includes(data.role)) redirect("/"); return { user, role: data.role as "admin" | "photographer" }; }
