import type { MetadataRoute } from "next"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://didemkaraca.com").replace(/\/$/, "")

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/#portfolio`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/#about`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/#contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]
}
