type WhatsAppMessage = { to?: string | null; text: string };

export async function sendWhatsApp({ to, text }: WhatsAppMessage) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const number = to?.replace(/\D/g, "");
  if (!token || !phoneId || !number) return { skipped: true };
  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: number, type: "text", text: { body: text.slice(0, 4096) } }) });
  if (!response.ok) throw new Error(`Falha ao enviar WhatsApp (${response.status})`);
  return { skipped: false };
}
