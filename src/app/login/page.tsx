"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function change(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function login() {

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({

        email: form.email,

        password: form.password,

      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/minha-conta");

  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8">

        <h1 className="text-3xl font-bold mb-8">
          Entrar
        </h1>

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={change}
          className="w-full mb-4 rounded-lg bg-neutral-800 p-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={change}
          className="w-full mb-6 rounded-lg bg-neutral-800 p-3"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-lg bg-red-600 hover:bg-red-700 py-3 font-bold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

      </div>

    </main>

  );

}