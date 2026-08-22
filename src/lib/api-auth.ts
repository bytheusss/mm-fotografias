import { createClient } from "@/lib/supabase/server";

export async function getApiUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isApiAdmin() {
  const user = await getApiUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return ["owner", "admin"].includes(data?.role || "");
}
