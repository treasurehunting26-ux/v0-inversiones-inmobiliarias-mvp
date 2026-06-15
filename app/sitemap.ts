import type { MetadataRoute } from "next"
import { getAllGuideSlugs } from "@/lib/guides"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aterra.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/oportunidades`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/guias`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/asistente`, changeFrequency: "monthly", priority: 0.7 },
  ]

  const guideRoutes: MetadataRoute.Sitemap = getAllGuideSlugs().map((slug) => ({
    url: `${BASE_URL}/guias/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...guideRoutes]
}
