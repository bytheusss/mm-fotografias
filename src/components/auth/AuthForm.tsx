"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode, next }: { mode: "login" | "signup" | "forgot" | "update"; next?: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next?.startsWith("/") ? next : "/minha-conta");
        router.refresh();
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { name }, emailRedirectTo: `${location.origin}/auth/callback?next=/minha-conta` },
        });
        if (error) throw error;
        setMessage("Cadastro recebido. Confira seu e-mail para confirmar a conta.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/alterar-senha`,
        });
        if (error) throw error;
        setMessage("Se o e-mail estiver cadastrado, enviaremos o link de recuperação.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Senha alterada com sucesso.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally { setLoading(false); }
  }

  const title = { login: "Entrar", signup: "Criar conta", forgot: "Recuperar senha", update: "Alterar senha" }[mode];
  return <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    {mode === "signup" && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3" />}
    {mode !== "update" && <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3" />}
    {(mode === "login" || mode === "signup" || mode === "update") && <input required minLength={8} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha (mínimo 8 caracteres)" className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3" />}
    {message && <p role="status" className="rounded-lg bg-neutral-800 p-3 text-sm">{message}</p>}
    <button disabled={loading} className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold disabled:opacity-60">{loading ? "Aguarde..." : title}</button>
    {mode === "login" && <div className="flex justify-between text-sm"><a href="/recuperar-senha">Esqueci minha senha</a><a href="/cadastro">Criar conta</a></div>}
  </form>;
}
