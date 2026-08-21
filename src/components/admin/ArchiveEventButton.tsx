"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveEventButton({ id, archived }: { id: string; archived: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return <button type="button" disabled={loading} onClick={async () => { setLoading(true); const response = await fetch(`/api/admin/events/${id}/archive`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: !archived }) }); setLoading(false); if (response.ok) router.refresh(); }} className="rounded-lg bg-neutral-700 px-4 py-2 font-bold disabled:opacity-50">{loading ? "Salvando..." : archived ? "Restaurar" : "Arquivar"}</button>;
}
