import type { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/events";
import { SITE } from "@/lib/constants/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const now = new Date(); const staticPages = ["", "/eventos", "/fotografos", "/privacidade", "/termos"].map(path => ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 })); const events = (await getAllEvents()).map(event => ({ url: `${SITE.url}/eventos/${event.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })); return [...staticPages, ...events]; }
