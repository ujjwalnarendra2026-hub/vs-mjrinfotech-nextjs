import type { MetadataRoute } from "next";
import { SERVICE_SLUGS } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://vs-mjrinfotech.com";
  const now = new Date();

  const staticRoutes = ["/", "/about", "/contact", "/careers", "/certificates"];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...SERVICE_SLUGS.map((slug) => ({
      url: `${base}/services/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
