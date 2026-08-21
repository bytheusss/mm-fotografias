import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "M&M Fotografias", short_name: "M&M Fotos", description: "Encontre, selecione e compre suas fotos de eventos.", start_url: "/", display: "standalone", background_color: "#000000", theme_color: "#dc2626", icons: [{ src: "/images/logo.png", sizes: "any", type: "image/png" }] }; }
