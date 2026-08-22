export type AppRole = "owner" | "admin" | "support" | "photographer" | "client";
export function allRoles(profile?: { role?: string | null; roles?: string[] | null } | null) {
  return [...new Set([profile?.role, ...(profile?.roles || [])].filter(Boolean))] as AppRole[];
}
export function hasRole(profile: { role?: string | null; roles?: string[] | null } | null | undefined, allowed: AppRole[]) {
  return allRoles(profile).some(role => allowed.includes(role));
}
export const ROLE_LABELS: Record<AppRole, string> = { owner: "Proprietário", admin: "Administrador", support: "Atendimento", photographer: "Fotógrafo", client: "Cliente" };
export function publicRoleLabels(profile: { role?: string | null; roles?: string[] | null }) {
  return allRoles(profile).filter(role => role !== "client").map(role => ROLE_LABELS[role]);
}
