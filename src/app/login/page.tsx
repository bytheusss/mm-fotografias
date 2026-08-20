import { AuthForm } from "@/components/auth/AuthForm";
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const { next } = await searchParams; return <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white"><AuthForm mode="login" next={next} /></main>; }
