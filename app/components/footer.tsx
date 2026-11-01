import Link from 'next/link'
import { site } from '@/lib/site'
import { features } from '@/lib/features'
import { CopyButton } from './copy-button'

const explore = [
  { href: '/#services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/#experience', label: 'Timeline' },
  { href: '/blog', label: 'Writing' },
  { href: '/#contact', label: 'Contact' },
]

const linkClass = 'text-muted transition-colors hover:text-fg'

export function Footer() {
  return (
    <footer className="footer-flow border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-10 pt-16 text-sm md:grid-cols-[1.4fr_1fr_1.2fr]">
        {/* Who and where, with the same monogram as the nav. */}
        <div>
          <Link prefetch href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight" aria-label={`${site.name} — home`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface font-mono text-[13px] font-semibold" aria-hidden="true">
              <span className="text-sec">{site.initials[0]}</span>
              <span className="text-web">{site.initials[1]}</span>
            </span>
            <span className="text-base">{site.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-muted">
            <span className="text-sec">Break it</span>, then <span className="text-web">build it</span> better. {site.role}.
          </p>
          <p className="mt-4 text-muted">{site.location}</p>
          {site.available && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
              Open to new work
            </p>
          )}
        </div>

        <nav aria-label="Footer">
          <p className="label">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1">
            {explore.map((l) => (
              <li key={l.href}>
                <Link prefetch href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label">Get in touch</p>
          <ul className="mt-4 space-y-3">
            <li className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${site.email}`} className="break-all text-fg transition-colors hover:text-web">
                {site.email}
              </a>
              <CopyButton value={site.email} label="email address" />
            </li>
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {s.label} ↗
                </a>
              </li>
            ))}
            <li>
              <Link href="/rss" className={linkClass}>
                RSS feed
              </Link>
            </li>
          </ul>
          {features.commandPalette && (
            <p className="mt-6 hidden text-muted md:block">
              Press <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-fg">Ctrl</kbd>{' '}
              <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-fg">K</kbd> to search the site.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p className="font-mono">
            Next.js · strict CSP · no trackers · no third-party requests ·{' '}
            <Link href="/sitemap.xml" className={linkClass}>
              sitemap
            </Link>
          </p>
          <a href="#main" className={`${linkClass} self-start md:self-auto`}>
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
