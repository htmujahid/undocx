import type { MetadataRoute } from "next";

const site = "https://undocx.app";
const pages = [
  { path: "", priority: 1 },
  { path: "/features", priority: 0.8 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority }) => ({ url: `${site}${path}`, changeFrequency: "monthly", priority }));
}
