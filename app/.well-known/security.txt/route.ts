import { baseUrl, site } from '@/lib/site'

/*
  RFC 9116 security.txt, generated from lib/site.ts when the site is built. Expires is set
  just under a year after the build (the RFC asks for less than a year), so every deploy
  refreshes it and a site left untouched for a year shows up as stale.
*/
export const dynamic = 'force-static'

const DAY = 24 * 60 * 60 * 1000

export function GET() {
  const expires = new Date(Date.now() + 335 * DAY)
  expires.setUTCHours(0, 0, 0, 0)
  const body = [
    `Contact: mailto:${site.email}`,
    `Contact: ${baseUrl}/#contact`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: en',
    `Canonical: ${baseUrl}/.well-known/security.txt`,
  ]
  return new Response(body.join('\n') + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
