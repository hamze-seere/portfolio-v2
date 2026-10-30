import type { MetadataRoute } from 'next'
import { getPosts, getWork } from '@/lib/content'
import { baseUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split('T')[0]
  return [
    ...['', '/work', '/blog'].map((r) => ({ url: `${baseUrl}${r}`, lastModified: today })),
    ...getWork().map((w) => ({ url: `${baseUrl}/work/${w.slug}`, lastModified: today })),
    ...getPosts().map((p) => ({ url: `${baseUrl}/blog/${p.slug}`, lastModified: p.metadata.publishedAt })),
  ]
}
