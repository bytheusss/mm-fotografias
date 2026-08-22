import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/roles";

export async function getApiUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isApiAdmin() {
  const user = await getApiUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role,roles").eq("id", user.id).maybeSingle();
  return hasRole(data, ["owner", "admin"]);
}
