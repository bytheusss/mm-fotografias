import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/roles";
import { HelpDesk } from "@/components/support/HelpDesk";

export default async function Page() {
  const user = await getUser();
  let staff = false;
  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("role,roles").eq("id", user.id).maybeSingle();
    staff = hasRole(profile, ["owner", "admin", "support", "photographer"]);
  }
  return <main className="min-h-screen bg-black px-4 pb-24 pt-32 text-white sm:px-6"><div className="mx-auto max-w-6xl"><p className="font-bold uppercase tracking-widest text-red-500">Central de ajuda</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Estamos por perto.</h1><p className="mb-8 mt-3 text-neutral-400">Atendimento pelo site ou encaminhamento inteligente para o WhatsApp.</p><HelpDesk logged={Boolean(user)} staff={staff}/></div></main>;
}
