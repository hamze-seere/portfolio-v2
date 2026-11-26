/*
  Checks the security claims the Hardened Portfolio case study makes, against a running
  build. CI runs it on every push; locally: `npm run build && npm start`, then `npm run verify`.

    BASE_URL=https://hamse-yo-xs.vercel.app npm run verify   # or check the live site

  No dependencies: plain fetch and regular expressions, so it can't break with a package update.
*/

const base = new URL(process.env.BASE_URL ?? 'http://localhost:3000')
const PAGES = ['/', '/work', '/work/hardened-portfolio', '/blog']
const YEAR = 366 * 24 * 60 * 60 * 1000

let failed = 0
const check = (ok, label, detail = '') => {
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✗'} ${label}${!ok && detail ? ` — ${detail}` : ''}`)
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(base, { redirect: 'manual' })
      return
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  throw new Error(`No server at ${base} after 30 seconds`)
}

function directives(csp) {
  const map = new Map()
  for (const part of csp.split(';')) {
    const [name, ...values] = part.trim().split(/\s+/)
    if (name) map.set(name, values)
  }
  return map
}

/** URLs the browser fetches on its own: scripts, styles, images, frames, media. Not <a> links. */
function fetchedUrls(html) {
  const urls = []
  for (const [, tag, attrs] of html.matchAll(/<(script|link|img|iframe|source|video|audio|embed|object)\b([^>]*)>/gi)) {
    // Canonical and alternate links are addresses, not downloads.
    if (tag.toLowerCase() === 'link' && /\brel="(canonical|alternate)"/i.test(attrs)) continue
    for (const [, name, value] of attrs.matchAll(/\s(src|href|srcset|data)="([^"]*)"/gi)) {
      const list = name.toLowerCase() === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [value]
      urls.push(...list.filter(Boolean))
    }
  }
  return urls
}

async function checkPage(path) {
  const res = await fetch(new URL(path, base), { redirect: 'manual' })
  const html = await res.text()
  const h = res.headers
  console.log(`\n${path}`)
  check(res.status === 200, 'responds 200', `got ${res.status}`)

  const csp = h.get('content-security-policy') ?? ''
  const d = directives(csp)
  const script = d.get('script-src') ?? []
  const nonce = script.find((v) => v.startsWith("'nonce-"))?.slice(7, -1)
  check(Boolean(nonce), 'script-src has a per-request nonce', csp || 'no CSP header')
  check(script.includes("'strict-dynamic'"), "script-src uses 'strict-dynamic'")
  check(!script.includes("'unsafe-inline'") && !script.includes("'unsafe-eval'"), "no 'unsafe-inline' or 'unsafe-eval' for scripts")
  check(d.get('object-src')?.join(' ') === "'none'", "object-src 'none'")
  check(d.get('base-uri')?.join(' ') === "'none'", "base-uri 'none'")
  check(d.get('frame-ancestors')?.join(' ') === "'none'", "frame-ancestors 'none'")

  // Every script tag must carry this response's nonce, or the CSP would block it.
  // JSON data blocks (JSON-LD, Next's payloads) never run, so they don't need one.
  const scripts = [...html.matchAll(/<script\b([^>]*)>/gi)].filter(([, attrs]) => !/\stype="application\/(ld\+)?json"/i.test(attrs))
  const unsigned = scripts.filter(([, attrs]) => !attrs.includes(`nonce="${nonce}"`))
  check(unsigned.length === 0, `all ${scripts.length} script tags carry the nonce`, `${unsigned.length} without it`)

  const hsts = h.get('strict-transport-security') ?? ''
  check(/max-age=(\d+)/.test(hsts) && Number(hsts.match(/max-age=(\d+)/)[1]) >= 31536000 && /includeSubDomains/i.test(hsts) && /preload/i.test(hsts), 'HSTS: a year or more, includeSubDomains, preload', hsts)
  check(h.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff')
  check(h.get('x-frame-options') === 'DENY', 'X-Frame-Options: DENY')
  check(Boolean(h.get('referrer-policy')), 'Referrer-Policy set')
  check(Boolean(h.get('permissions-policy')), 'Permissions-Policy set')
  check(h.get('cross-origin-opener-policy') === 'same-origin', 'Cross-Origin-Opener-Policy: same-origin')
  check(!h.has('x-powered-by'), 'no X-Powered-By header')

  const foreign = fetchedUrls(html).filter((u) => !u.startsWith('data:') && new URL(u, base).origin !== base.origin)
  check(foreign.length === 0, 'no third-party requests in the HTML', foreign.slice(0, 3).join(', '))
  return nonce
}

async function main() {
  await waitForServer()
  console.log(`Checking ${base.origin}`)

  const nonces = []
  for (const path of PAGES) nonces.push(await checkPage(path))
  console.log('')
  check(new Set(nonces).size === nonces.length, 'a new nonce on every request')

  const res = await fetch(new URL('/.well-known/security.txt', base))
  const txt = await res.text()
  console.log('\n/.well-known/security.txt')
  check(res.status === 200, 'responds 200', `got ${res.status}`)
  check(res.headers.get('content-type')?.startsWith('text/plain'), 'served as text/plain')
  check(/^Contact: \S+/m.test(txt), 'has a Contact field')
  const expires = Date.parse(txt.match(/^Expires: (\S+)/m)?.[1] ?? '')
  check(expires > Date.now() && expires - Date.now() < YEAR, 'Expires is in the future and less than a year away', txt.match(/^Expires: .*/m)?.[0])

  // Pages render per request (the nonce), so an MDX error would only show when someone opens
  // the page. Open every page in the sitemap: each must render and carry the CSP.
  const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text()
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname)
  console.log(`\nEvery page in the sitemap (${paths.length})`)
  check(paths.length > 0, 'sitemap lists pages')
  for (const path of paths) {
    const page = await fetch(new URL(path, base), { redirect: 'manual' })
    check(page.status === 200 && page.headers.has('content-security-policy'), `${path} renders with a CSP`, `status ${page.status}`)
  }

  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.')
  process.exit(failed ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
