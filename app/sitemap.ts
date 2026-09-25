import type { MetadataRoute } from 'next'

import { RECORDS } from '@/lib/catalog'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/order`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const records: MetadataRoute.Sitemap = RECORDS.map((r) => ({
    url: `${SITE}/records/${r.slug}`,
    lastModified: new Date(`${r.added}T12:00:00Z`),
    changeFrequency: 'weekly',
    priority: r.featured ? 0.9 : 0.7,
  }))

  return [...pages, ...records]
}
