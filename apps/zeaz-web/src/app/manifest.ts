import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZEAZDEV Company Limited",
    short_name: "ZEAZDEV",
    description:
      "Production-ready AI automation, Cloudflare-first edge operations, SaaS products, and developer platforms for zeaz.dev.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#030712",
    categories: ["business", "developer", "productivity", "technology"],
  };
}
