import type { MetadataRoute } from "next";
import { privatePages, siteBaseUrl } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...privatePages.flatMap((path) => [`/*${path}`, path])],
    },
    sitemap: `${siteBaseUrl}/sitemap.xml`,
  };
}
