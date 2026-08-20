type PurchaseEmail = { to: string; name?: string; orderId: string; total: number; token?: string | null; kind: "created" | "paid" };

export async function sendPurchaseEmail(input: PurchaseEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mmfotografias.com.br";
  if (!apiKey || !from) return { skipped: true };
  const paid = input.kind === "paid";
  const download = paid && input.token ? `<p><a href="${siteUrl}/download/${encodeURIComponent(input.token)}">Baixar fotografias</a></p>` : "";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [input.to], subject: paid ? "Pagamento confirmado — M&M Fotografias" : "Pedido recebido — M&M Fotografias", html: `<h1>${paid ? "Pagamento confirmado" : "Pedido recebido"}</h1><p>Olá, ${input.name || "cliente"}. Seu pedido #${input.orderId.slice(0,8).toUpperCase()} ${paid ? "foi aprovado" : "foi criado"}.</p><p>Total: R$ ${input.total.toFixed(2).replace(".", ",")}</p>${download}` }),
  });
  if (!response.ok) throw new Error(`Falha ao enviar e-mail (${response.status})`);
  return { skipped: false };
}
