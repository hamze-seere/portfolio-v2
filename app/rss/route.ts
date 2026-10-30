import { getPosts } from '@/lib/content'
import { baseUrl, site } from '@/lib/site'

// The starter interpolated raw strings into XML; escape them so a title can't break the feed.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function GET() {
  const items = getPosts()
    .map(
      (p) => `    <item>
      <title>${esc(p.metadata.title)}</title>
      <link>${baseUrl}/blog/${p.slug}</link>
      <guid>${baseUrl}/blog/${p.slug}</guid>
      <description>${esc(p.metadata.summary ?? '')}</description>
      <pubDate>${new Date(p.metadata.publishedAt).toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)} — Writing</title>
    <link>${baseUrl}</link>
    <description>${esc('Notes on application security and web development.')}</description>
${items}
  </channel>
</rss>`

  return new Response(feed, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
