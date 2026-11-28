import type { MetadataRoute } from "next";

const site = "https://undocx.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/chat", "/documents", "/library"] }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
