export type AppRole = "owner" | "admin" | "support" | "photographer" | "client";
export function allRoles(profile?: { role?: string | null; roles?: string[] | null } | null) {
  return [...new Set([profile?.role, ...(profile?.roles || [])].filter(Boolean))] as AppRole[];
}
export function hasRole(profile: { role?: string | null; roles?: string[] | null } | null | undefined, allowed: AppRole[]) {
  return allRoles(profile).some(role => allowed.includes(role));
}
