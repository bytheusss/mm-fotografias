import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/checkout", "/minha-conta/", "/download/"] }, sitemap: `${SITE.url}/sitemap.xml`, host: SITE.url }; }
