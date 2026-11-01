'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { site } from '@/lib/site'
import { links } from './nav-links'

/*
  The nav's moving parts. At the top of the page it is a plain bar; once you scroll it
  becomes a floating capsule (21st.dev "Morphing Scroll Navbar"), shrinks while you keep
  scrolling down and comes back as soon as you scroll up. A thin violet → blue line along
  its bottom edge fills as you read. On phones the links move into a "Menu" pill that
  flows open into a panel (21st.dev "Liquid Morph Floating Menu"). Styles: .nav-* in
  globals.css.
*/
type Mode = 'top' | 'float' | 'compact'

export function NavShell({ children, progress }: { children: React.ReactNode; progress: boolean }) {
  const pathname = usePathname()
  const pill = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('top')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = scrollY
    let frame = 0
    const check = () => {
      frame = 0
      const y = scrollY
      if (y < 24) setMode('top')
      else if (y > last + 4 && y > 320) setMode('compact')
      else if (y < last - 4) setMode('float')
      else setMode((m) => (m === 'top' ? 'float' : m))
      last = y
      const max = document.documentElement.scrollHeight - innerHeight
      pill.current?.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => setOpen(false), [pathname])

  // While the menu is open: Esc, a tap outside it, or growing to tablet width closes it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => !pill.current?.contains(e.target as Node) && setOpen(false)
    const wide = matchMedia('(min-width: 768px)')
    const onWide = () => wide.matches && setOpen(false)
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    wide.addEventListener('change', onWide)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pointerdown', onDown)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  // The header keeps a fixed height: if the capsule's size changes moved the page,
  // scroll anchoring would nudge scrollY back and flip compact ↔ float in a loop.
  return (
    <header className="pointer-events-none sticky top-0 z-40 h-19 px-3 pt-3">
      <div ref={pill} className="nav-pill pointer-events-auto" data-mode={mode} data-open={open || undefined}>
        <div className="nav-row">
          {children}
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
            <span className="nav-burger" aria-hidden="true" />
          </button>
        </div>

        <div id="nav-menu" className="nav-panel" inert={!open}>
          <div>
            <ul className="px-3 pb-4" onClick={(e) => (e.target as Element).closest('a') && setOpen(false)}>
              {[...links, { href: '/#contact', label: 'Contact' }].map((l, i) => (
                <li key={l.href} style={{ '--i': i } as React.CSSProperties}>
                  <Link prefetch href={l.href} className="flex items-baseline justify-between border-b border-line py-3.5 text-2xl font-semibold tracking-tight">
                    {l.label}
                    <span className="font-mono text-xs font-normal text-muted">0{i + 1}</span>
                  </Link>
                </li>
              ))}
              <li style={{ '--i': links.length + 1 } as React.CSSProperties}>
                <a href={site.github.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between pt-4 text-sm text-muted">
                  GitHub · {site.github.handle}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {progress && <span className="nav-progress" aria-hidden="true" />}
      </div>
    </header>
  )
}
