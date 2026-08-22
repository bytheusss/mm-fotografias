import { isApiAdmin } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auditAdmin } from "@/lib/audit";

const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  if (!(await isApiAdmin())) return new Response("Acesso negado", { status: 403 });
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  let query = supabaseAdmin.from("orders").select("id,created_at,name,email,whatsapp,status,total,coupon_code,discount_amount,photos").order("created_at", { ascending: false });
  if (status && ["paid", "pending", "cancelled"].includes(status)) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return new Response("Falha ao gerar relatório", { status: 500 });
  const rows = ["pedido,data,nome,email,whatsapp,status,fotos,cupom,desconto,total", ...(data || []).map(order => [order.id, order.created_at, order.name, order.email, order.whatsapp, order.status, Array.isArray(order.photos) ? order.photos.length : 0, order.coupon_code, order.discount_amount, order.total].map(csv).join(","))];
  await auditAdmin("export", "orders_csv", null, { status: status || "all", rows: data?.length || 0 });
  return new Response("\uFEFF" + rows.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="pedidos-${new Date().toISOString().slice(0,10)}.csv"`, "Cache-Control": "private, no-store" } });
}
