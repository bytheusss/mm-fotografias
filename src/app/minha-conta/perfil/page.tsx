import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function Page() {
  const user = await requireUser("/minha-conta/perfil");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle();
  return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><div className="mx-auto max-w-2xl"><h1 className="mb-8 text-4xl font-bold">Editar perfil</h1><ProfileForm initial={{ id: user.id, email: user.email || "", name: data?.full_name || user.user_metadata?.name || "", whatsapp: data?.phone || user.user_metadata?.whatsapp || "" }} /><a className="mt-6 inline-block" href="/alterar-senha">Alterar minha senha</a></div></main>;
}
