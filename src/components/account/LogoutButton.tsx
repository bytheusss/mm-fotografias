"use client";
import { createClient } from "@/lib/supabase/client";
export function LogoutButton() { return <button className="rounded-lg border border-neutral-700 px-4 py-2" onClick={async()=>{ await createClient().auth.signOut(); location.href="/"; }}>Sair</button>; }
