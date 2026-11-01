import Link from 'next/link'
import { site } from '@/lib/site'
import { PaletteButton } from './command-palette'
import { features } from '@/lib/features'
import { HyperText } from '@/components/ui/hyper-text'
import { ShineBorder } from '@/components/ui/shine-border'
import { NavLinks } from './nav-links'
import { NavShell } from './nav-shell'

export function Nav() {
  return (
    <NavShell progress={features.scrollProgress}>
      <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight" aria-label={`${site.name} — home`}>
        {/* Monogram: first initial in the security accent, second in the web accent. */}
        <span className="nav-mono relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-surface font-mono text-[13px] font-semibold transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" aria-hidden="true">
          <span className="text-sec">{site.initials[0]}</span>
          <span className="text-web">{site.initials[1]}</span>
        </span>
        {/* The link's aria-label already names it; the scrambling word is decoration. */}
        <HyperText className="hidden sm:inline-grid" delay={300}>
          {site.shortName}
        </HyperText>
      </Link>
      <nav aria-label="Primary" className="ml-auto flex items-center gap-1 text-sm">
        <NavLinks />
        {features.commandPalette && <PaletteButton />}
        <a
          href={site.github.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub profile (${site.github.handle})`}
          className="hidden rounded-full p-2 text-muted transition-colors hover:text-fg md:block"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        <Link href="/#contact" className="btn-shine relative ml-1 overflow-hidden rounded-full bg-fg px-4 py-2 font-medium text-bg transition-opacity hover:opacity-90">
          <ShineBorder borderWidth={1.5} duration={10} shineColor={['#a78bfa', '#60a5fa']} />
          Hire me
        </Link>
      </nav>
    </NavShell>
  )
}
