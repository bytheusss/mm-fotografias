import { requireStaff } from "@/lib/auth";
export default async function PhotographerLayout({ children }: { children: React.ReactNode }) { await requireStaff(); return children; }
