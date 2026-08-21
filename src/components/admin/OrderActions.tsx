"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  orderId: string;
  status: string;
  downloadToken?: string | null;
  revoked?: boolean;
  adminNotes?: string | null;
  refundStatus?: string;
}

export default function OrderActions({
  orderId,
  status,
  downloadToken,
  revoked = false,
  adminNotes = "",
  refundStatus = "none",
}: Props) {

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(adminNotes || "");

  async function update(
    body: any
  ) {

    setLoading(true);

    const res =
      await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

    const data =
      await res.json();

    if (!data.success) {

      alert(
        data.error || "Erro."
      );

    } else {

      router.refresh();

    }

    setLoading(false);

  }

  async function copyToken() {

    if (!downloadToken) {

      alert("Pedido ainda não possui token.");

      return;

    }

    await navigator.clipboard.writeText(downloadToken);

    alert("Token copiado.");

  }

  return (

    <div className="grid grid-cols-2 gap-3 pt-5">

      <button
        disabled={loading || status === "paid"}
        onClick={() =>
          update({
            status: "paid",
          })
        }
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg py-3 font-bold"
      >
        Pago
      </button>

      <button disabled={loading} onClick={() => update({ downloadAction: revoked ? "restore" : "revoke" })} className="col-span-2 rounded-lg bg-neutral-700 py-3 font-bold hover:bg-neutral-600">{revoked ? "Restaurar downloads" : "Revogar downloads"}</button>
      <button disabled={loading} onClick={() => update({ downloadAction: "extend" })} className="col-span-2 rounded-lg bg-neutral-700 py-3 font-bold hover:bg-neutral-600">Renovar acesso por 30 dias</button>
      <label className="col-span-2 text-sm text-neutral-400">Controle de estorno<select defaultValue={refundStatus} onChange={event => update({ refundStatus: event.target.value })} className="mt-2 w-full rounded-lg bg-neutral-800 p-3 text-white"><option value="none">Nenhum</option><option value="requested">Solicitado</option><option value="processing">Em análise</option><option value="refunded">Estornado</option><option value="rejected">Recusado</option></select></label>
      <label className="col-span-2 text-sm text-neutral-400">Notas internas<textarea value={notes} onChange={event => setNotes(event.target.value)} rows={4} className="mt-2 w-full rounded-lg bg-neutral-800 p-3 text-white" /></label>
      <button disabled={loading} onClick={() => update({ adminNotes: notes })} className="col-span-2 rounded-lg bg-blue-700 py-3 font-bold hover:bg-blue-600">Salvar notas</button>

      <button
        disabled={loading || status === "pending"}
        onClick={() =>
          update({
            status: "pending",
          })
        }
        className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg py-3 font-bold"
      >
        Pendente
      </button>

      <button
        disabled={loading || status === "cancelled"}
        onClick={() =>
          update({
            status: "cancelled",
          })
        }
        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg py-3 font-bold"
      >
        Cancelar
      </button>

      <button
        disabled={loading}
        onClick={() =>
          update({
            generateToken: true,
          })
        }
        className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-bold"
      >
        Gerar Token
      </button>

      <button
        disabled={!downloadToken}
        onClick={copyToken}
        className="col-span-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 rounded-lg py-3 font-bold"
      >
        Copiar Token
      </button>

    </div>

  );

}
