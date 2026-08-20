"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  orderId: string;
  status: string;
  downloadToken?: string | null;
}

export default function OrderActions({
  orderId,
  status,
  downloadToken,
}: Props) {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

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