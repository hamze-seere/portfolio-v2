import type { Metadata, Viewport } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import { ViewTransition } from 'react'
import { Nav } from './components/nav'
import { Footer } from './components/footer'
import { CommandPalette, type PaletteItem } from './components/command-palette'
import { Effects } from './components/effects'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { getPosts, getWork } from '@/lib/content'
import { features } from '@/lib/features'
import { baseUrl, site } from '@/lib/site'
import './globals.css'

function paletteItems(): PaletteItem[] {
  return [
    { id: 'page:home', label: 'Home', group: 'Pages', href: '/' },
    { id: 'page:work', label: 'All work', group: 'Pages', href: '/work' },
    { id: 'page:services', label: 'Services', group: 'Pages', href: '/#services' },
    { id: 'page:timeline', label: 'Timeline', group: 'Pages', href: '/#experience' },
    { id: 'page:certificates', label: 'Certificates', group: 'Pages', href: '/#certificates' },
    { id: 'page:writing', label: 'Writing', group: 'Pages', href: '/blog' },
    { id: 'page:contact', label: 'Contact', group: 'Pages', href: '/#contact' },
    ...getWork().map((w) => ({ id: `work:${w.slug}`, label: w.metadata.title, group: 'Projects' as const, hint: w.metadata.track === 'both' ? 'security + web' : w.metadata.track, href: `/work/${w.slug}` })),
    ...getPosts().map((p) => ({ id: `post:${p.slug}`, label: p.metadata.title, group: 'Writing' as const, href: `/blog/${p.slug}` })),
    { id: 'action:copy-email', label: 'Copy email address', group: 'Actions', hint: site.email },
    { id: 'action:github', label: 'Open GitHub', group: 'Actions', hint: `github.com/${site.github.handle}`, href: site.github.href, external: true },
    ...site.socials.filter((s) => s.label !== 'GitHub').map((s) => ({ id: `action:${s.label.toLowerCase()}`, label: `Open ${s.label}`, group: 'Actions' as const, hint: s.label.toLowerCase(), href: s.href, external: true })),
  ]
}

/* Archivo + JetBrains Mono — the families from templates/fonts, loaded through
   next/font so they ship as subset, self-hosted woff2 (no third-party request). */
const sans = Archivo({ subsets: ['latin'], variable: '--f-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--f-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: `${site.name} — ${site.role}`, template: `%s · ${site.name}` },
  description: site.intro,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.intro,
    url: baseUrl,
    siteName: site.name,
    locale: 'en_US',
    type: 'website',
    images: [`/og?title=${encodeURIComponent(site.role)}`],
  },
  alternates: { types: { 'application/rss+xml': `${baseUrl}/rss` } },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#07061a',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the request makes every page render per request, so Next can stamp the
  // CSP nonce from proxy.ts onto its scripts. Static pages would be blocked by the CSP.
  await headers()
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-bg text-fg antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        {features.scrollProgress && <ScrollProgress className="h-0.5 from-sec via-[color-mix(in_srgb,var(--sec)_40%,var(--web))] to-web" />}
        <Nav />
        <main id="main">{features.pageTransitions ? <ViewTransition>{children}</ViewTransition> : children}</main>
        <Footer />
        <Effects reveal={features.scrollReveal} spotlight={features.spotlightCards} />
        {features.commandPalette && <CommandPalette items={paletteItems()} />}
      </body>
    </html>
  )
}
