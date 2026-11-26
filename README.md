# Portfolio — Security Engineer & Web Developer

Next.js 16 (App Router) · React 19 · Tailwind 4 · MDX (next-mdx-remote).

```
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Built from the downloaded templates
- **templates/portfolio-blog-starter** → MDX blog, RSS, sitemap, robots, OG image route, MDX renderer (`app/components/mdx.tsx`, `lib/content.ts`)
- **templates/nextjs-with-strict-csp** → per-request nonce CSP (`proxy.ts`)
- **templates/fonts** → Archivo + JetBrains Mono (loaded via `next/font` as subset woff2)

## Edit content
- `lib/site.ts` — name, intro, stats, services, experience, toolbox, socials
- `content/work/*.mdx` — case studies (`track: security | web | both`)
- `content/posts/*.mdx` — blog posts
- Set `NEXT_PUBLIC_SITE_URL` to your domain (used by sitemap, RSS, OG, JSON-LD)

## Optional effects
Decrypting headline, scroll reveals + stat count-up, spotlight cards, Ctrl/⌘+K command palette and page transitions. Each has an on/off switch in `lib/features.ts` — set it to `false` and rebuild to remove it. All of them turn off for visitors who prefer reduced motion.

## Contact form
Set `RESEND_API_KEY` to email messages to `CONTACT_TO` (default: `site.email`); `CONTACT_FROM` sets the sender once you verify a domain in Resend. Or set `CONTACT_WEBHOOK_URL` to receive the raw JSON (n8n, Zapier, Make…). Without either, dev logs to the console and production shows "not connected".

Spam protection: a honeypot field, a minimum fill time (the page stamps when it was served, so the form also works without JavaScript) and a per-IP rate limit of 5 messages per 10 minutes. IPs are HMAC-hashed before they are used as keys, so raw addresses are never stored. Connect Upstash Redis to the Vercel project (Storage → Upstash for Redis; it sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`) and the limit is shared by every server instance; without it each instance keeps its own count in memory.

## Security
Nonce CSP with `strict-dynamic` (no `unsafe-inline` or `unsafe-eval` for scripts), HSTS, XCTO, XFO, Referrer, Permissions, COOP, CORP, and an RFC 9116 `/.well-known/security.txt` generated from `lib/site.ts`. The day/night choice is a cookie read on the server, so there is no inline theme script. The nonce means pages render per request (no static caching).

Inline `style` attributes are allowed (`style-src-attr 'unsafe-inline'`): the animation library, the image component and the syntax highlighter write them, and a style attribute can't run script. `<style>` elements still need the nonce.

```
npm run build && npm start
npm run verify     # checks the CSP, nonces, headers, third-party requests, security.txt and that every page renders
```

CI (`.github/workflows/ci.yml`) runs the dependency audit, the build and `npm run verify` on every push and pull request. Dependabot opens weekly update PRs for npm packages and the pinned GitHub Actions.

## Dependencies
Each runtime package and why it is here:

| Package | Why |
|---|---|
| `next`, `react`, `react-dom` | The framework. |
| `next-mdx-remote` | Renders the MDX case studies and posts on the server. |
| `sugar-high` | A ~1 KB syntax highlighter that runs on the server, so code blocks ship no highlighting JavaScript. |
| `motion` | Scroll reveals, the hero text and the animated diagrams. All of it turns off for reduced motion. |
| `lenis` | Eased mouse-wheel scrolling. Off for touch screens and reduced motion. |
| `clsx`, `tailwind-merge` | The `cn()` helper in `lib/utils.ts`: joins class names and drops Tailwind classes that conflict. |

The previous "clearance archive" design is saved in `templates/clearance-archive-template.zip`.
