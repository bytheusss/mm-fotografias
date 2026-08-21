"use client";
import { useRouter } from "next/navigation";
export default function CartLeadActions({ id, email, whatsapp }: { id: string; email: string; whatsapp?: string | null }) {
  const router = useRouter(); const message = encodeURIComponent("Olá! Você deixou fotos no carrinho da M&M Fotografias. Seu carrinho continua disponível para concluir a compra.");
  async function mark(values: object) { await fetch(`/api/admin/abandoned-carts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); router.refresh(); }
  return <div className="flex flex-wrap gap-2"><a href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Suas fotos estão esperando")}&body=${message}`} onClick={() => mark({ recoverySent: true })} className="rounded bg-blue-700 px-3 py-2 font-bold">E-mail</a>{whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${message}`} target="_blank" onClick={() => mark({ recoverySent: true })} className="rounded bg-green-700 px-3 py-2 font-bold">WhatsApp</a>}<button type="button" onClick={() => mark({ status: "dismissed" })} className="rounded bg-neutral-700 px-3 py-2">Dispensar</button></div>;
}
