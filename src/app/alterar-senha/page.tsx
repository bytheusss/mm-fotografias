import { AuthForm } from "@/components/auth/AuthForm";
import { requireUser } from "@/lib/auth";
export default async function Page() { await requireUser("/alterar-senha"); return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><AuthForm mode="update" /></main>; }
