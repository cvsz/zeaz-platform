import type { MetadataRoute } from "next";

const baseUrl = "https://zeaz.dev";

const routes = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/marketing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/marketing/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/marketing/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/marketing/terms", priority: 0.5, changeFrequency: "yearly" },
  { path: "/marketing/privacy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/marketing/refund", priority: 0.5, changeFrequency: "yearly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-01T00:00:00.000Z");

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
