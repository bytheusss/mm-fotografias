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

export async function sendRecoveryEmail(input: { to: string; name?: string | null; quantity: number }) {
  const apiKey = process.env.RESEND_API_KEY; const from = process.env.EMAIL_FROM; const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mm-fotografias.vercel.app";
  if (!apiKey || !from) return { skipped: true };
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [input.to], subject: "Suas fotos ainda estão esperando", html: `<h1>Suas fotos estão esperando</h1><p>Olá, ${input.name || "cliente"}. Você separou ${input.quantity} foto(s) na M&M Fotografias.</p><p><a href="${siteUrl}/carrinho">Continuar compra</a></p><p>Você recebeu esta mensagem porque autorizou um lembrete no checkout.</p>` }) });
  if (!response.ok) throw new Error(`Falha ao enviar e-mail (${response.status})`); return { skipped: false };
}
