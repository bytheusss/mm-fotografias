import { isApiAdmin } from "@/lib/api-auth";
import { auditAdmin } from "@/lib/audit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
export async function GET() {
  if (!(await isApiAdmin())) return new Response("Acesso negado", { status: 403 });
  const [{ data: people }, { data: photos }, { data: orders }] = await Promise.all([supabaseAdmin.from("profiles").select("id,full_name,email,commission_rate").eq("role", "photographer"), supabaseAdmin.from("photos").select("id,photographer_id").is("deleted_at", null), supabaseAdmin.from("orders").select("total,photos").eq("status", "paid")]);
  const authorByPhoto = new Map((photos || []).map(photo => [photo.id, photo.photographer_id])); const stats = new Map<string, { uploaded: number; sold: number; revenue: number }>();
  for (const photo of photos || []) if (photo.photographer_id) { const row = stats.get(photo.photographer_id) || { uploaded: 0, sold: 0, revenue: 0 }; row.uploaded++; stats.set(photo.photographer_id, row); }
  for (const order of orders || []) { const items = Array.isArray(order.photos) ? order.photos : []; const share = items.length ? Number(order.total || 0) / items.length : 0; for (const item of items) { const author = authorByPhoto.get(String(item.id)); if (!author) continue; const row = stats.get(author) || { uploaded: 0, sold: 0, revenue: 0 }; row.sold++; row.revenue += share; stats.set(author, row); } }
  const rows = ["fotografo,email,fotos_enviadas,fotos_vendidas,receita_atribuida,comissao_percentual,comissao_estimada", ...(people || []).map(person => { const row = stats.get(person.id) || { uploaded: 0, sold: 0, revenue: 0 }; const rate = Number(person.commission_rate || 0); return [person.full_name, person.email, row.uploaded, row.sold, row.revenue.toFixed(2), rate.toFixed(2), (row.revenue * rate / 100).toFixed(2)].map(csv).join(","); })];
  await auditAdmin("export", "photographers_csv", null, { rows: people?.length || 0 });
  return new Response("\uFEFF" + rows.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="fotografos-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" } });
}
