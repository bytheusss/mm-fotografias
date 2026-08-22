import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ProfessionalProfileForm } from "@/components/account/ProfessionalProfileForm";
import { hasRole } from "@/lib/roles";

export default async function Page() {
  const user = await requireUser("/minha-conta/perfil");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name,phone,role,roles,bio,instagram_handle,avatar_url,public_profile,public_title,public_whatsapp,availability_text,monthly_goal,featured_photo_ids").eq("id", user.id).maybeSingle();
  const name=data?.full_name || user.user_metadata?.name || "";
  return <main className="min-h-screen bg-black px-6 pb-24 pt-32 text-white"><div className="mx-auto max-w-2xl"><h1 className="mb-8 text-4xl font-bold">Editar perfil</h1><ProfileForm initial={{ id: user.id, email: user.email || "", name, whatsapp: data?.phone || user.user_metadata?.whatsapp || "" }} />{hasRole(data,["photographer"])&&<ProfessionalProfileForm initial={{name,bio:data?.bio||"",instagram:data?.instagram_handle||"",avatarUrl:data?.avatar_url||"",publicProfile:Boolean(data?.public_profile),publicTitle:data?.public_title||"",whatsapp:data?.public_whatsapp||"",availability:data?.availability_text||"",monthlyGoal:Number(data?.monthly_goal||0),featuredPhotoIds:data?.featured_photo_ids||[]}}/>}<a className="mt-6 inline-block" href="/alterar-senha">Alterar minha senha</a></div></main>;
}
