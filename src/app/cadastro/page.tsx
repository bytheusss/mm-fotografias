"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CadastroPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function change(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function register() {

    setLoading(true);

    const { error } =
      await supabase.auth.signUp({

        email: form.email,

        password: form.password,

        options: {
          data: {
            name: form.name,
          },
        },

      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Conta criada com sucesso!");

    router.push("/login");

  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8">

        <h1 className="text-3xl font-bold mb-8">
          Criar conta
        </h1>

        <input
          name="name"
          placeholder="Nome"
          value={form.name}
          onChange={change}
          className="w-full mb-4 rounded-lg bg-neutral-800 p-3"
        />

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
          onClick={register}
          disabled={loading}
          className="w-full rounded-lg bg-red-600 hover:bg-red-700 py-3 font-bold"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

      </div>

    </main>

  );

}