import "server-only";

export function integrationStatus() {
  return [
    { name: "Mercado Pago", configured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN), detail: "Pagamentos e webhook" },
    { name: "Supabase", configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY), detail: "Banco, autenticação e arquivos" },
    { name: "E-mail (Resend)", configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), detail: "Pedidos, pagamentos e recuperação" },
    { name: "WhatsApp oficial", configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID), detail: "Confirmações e recuperação" },
    { name: "Reconhecimento de placas", configured: Boolean(process.env.PLATE_RECOGNITION_ENDPOINT && process.env.PLATE_RECOGNITION_API_KEY), detail: "Leitura automática durante a gestão" },
    { name: "Monitoramento externo", configured: Boolean(process.env.ERROR_WEBHOOK_URL), detail: "Alertas de erros do site" },
  ];
}
