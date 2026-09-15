import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Özel/kimliğe bağlı alanları arama motorlarından uzak tut.
        disallow: ["/mesajlar", "/ayarlar", "/api/"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
