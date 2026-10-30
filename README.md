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
Set `CONTACT_WEBHOOK_URL` (Resend, Slack, n8n…). Without it, dev logs to the console and production shows "not connected".

## Security
Nonce CSP with `strict-dynamic`, HSTS, XCTO, XFO, Referrer, Permissions, COOP, CORP. The hero terminal re-requests the page and prints the headers it actually received. The nonce means pages render per request (no static caching).

The previous "clearance archive" design is saved in `templates/clearance-archive-template.zip`.
