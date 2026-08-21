import "server-only";
import { getApiUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function auditAdmin(action: string, entityType: string, entityId?: string | null, details: Record<string, unknown> = {}) {
  const user = await getApiUser();
  await supabaseAdmin.from("admin_audit_logs").insert({ admin_user_id: user?.id || null, action, entity_type: entityType, entity_id: entityId || null, details });
}
