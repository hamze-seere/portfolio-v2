'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, ViewTransition } from 'react'
import { TrackTag } from './track'
import { AnimatedList } from '@/components/ui/animated-list'
import { Safari } from '@/components/ui/safari'
import type { Track, WorkMeta } from '@/lib/content'
import { features } from '@/lib/features'
import { scanFeed } from '@/lib/site'

type Item = { slug: string; metadata: WorkMeta }
const FILTERS: { id: 'all' | Exclude<Track, 'both'>; label: string }[] = [
  { id: 'all', label: 'All work' },
  { id: 'security', label: 'Security' },
  { id: 'web', label: 'Web' },
]

/* Bento widths on the 3-column grid: rows zigzag wide/narrow, then narrow/wide,
   and a lone last card takes the full row, so every row is filled whatever the filter. */
function bentoSpans(n: number): (1 | 2 | 3)[] {
  const spans: (1 | 2 | 3)[] = []
  for (let row = 0; spans.length < n; row++) {
    if (n - spans.length === 1) spans.push(3)
    else spans.push(...(row % 2 === 0 ? ([2, 1] as const) : ([1, 2] as const)))
  }
  return spans
}
// Literal class names so Tailwind generates them.
const LG_SPAN = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' } as const
const SEVERITY = {
  high: 'bg-sec/15 text-sec',
  medium: 'bg-[#febc2e]/15 text-[#febc2e]',
  low: 'bg-web/15 text-web',
  pass: 'bg-ok/15 text-ok',
} as const

/*
  Glowing border, adapted from Aceternity's GlowingEffect (21st.dev) without the
  animation library: one delegated listener sets each card's --start angle towards
  the cursor, and CSS (an @property transition) eases the light round the border.
*/
function useGlow(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!features.glowCards || !matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      root.current?.querySelectorAll<HTMLElement>('[data-glow]').forEach((el) => {
        const r = el.getBoundingClientRect()
        const near = 64 // px around the card where the light already wakes up
        const active = e.clientX > r.left - near && e.clientX < r.right + near && e.clientY > r.top - near && e.clientY < r.bottom + near
        el.style.setProperty('--active', active ? '1' : '0')
        if (!active) return
        const target = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90
        // Turn the short way round, so the light never spins a full lap.
        const current = parseFloat(el.style.getPropertyValue('--start')) || 0
        const diff = ((((target - current + 180) % 360) + 360) % 360) - 180
        el.style.setProperty('--start', String(current + diff))
      })
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [root])
}

/* Filterable case-study bento grid. "Both" projects appear under either filter. */
export function WorkGrid({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const shown = items.filter((w) => filter === 'all' || w.metadata.track === filter || w.metadata.track === 'both')
  const spans = bentoSpans(shown.length)
  const grid = useRef<HTMLUListElement>(null)
  useGlow(grid)

  return (
    <>
      <div role="group" aria-label="Filter work" className="mb-8 inline-flex rounded-lg border border-line bg-surface p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${filter === f.id ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul ref={grid} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map(({ slug, metadata: m }, i) => {
          // The first project is the featured tile: always wide, with a larger title.
          const featured = i === 0 && shown.length > 1
          // On two columns, feature the first card full-width only when that leaves the rest in even rows.
          const mdSpan = i === 0 && shown.length % 2 === 1 ? 'md:col-span-2' : ''
          return (
            <li key={slug} className={`card-lift relative rounded-2xl ${mdSpan} ${LG_SPAN[spans[i]]}`}>
              {features.glowCards && <span data-glow className="glow-border" aria-hidden="true" />}
              <Link
                href={`/work/${slug}`}
                data-featured={featured || undefined}
                className="bento-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-muted/50 md:p-8"
              >
                {features.trackColors && <span className="track-bar" data-track={m.track} aria-hidden="true" />}
                <div className="flex flex-wrap items-center justify-between gap-3 whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    <TrackTag track={m.track} />
                    {featured && <span className="rounded-full bg-fg px-2 py-0.5 font-mono text-[11px] text-bg">Featured</span>}
                  </span>
                  <span className="flex items-center gap-3 font-mono text-xs text-muted">
                    {(m.repo || m.repos.length > 0) && (
                      <span className="rounded-full border border-ok/40 px-2 py-0.5 text-ok">
                        {m.repos.length > 1 ? `${m.repos.length} repos` : 'Open source'}
                      </span>
                    )}
                    {m.year}
                  </span>
                </div>
                <h3 className={`mt-6 font-semibold tracking-tight ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                  {features.pageTransitions ? (
                    // Same name as the case-study heading, so the title glides between pages.
                    <ViewTransition name={`work-title-${slug}`} share="morph" default="none">
                      <span className="inline-block">{m.title}</span>
                    </ViewTransition>
                  ) : (
                    m.title
                  )}
                </h3>
                <p className={`mt-3 max-w-2xl text-muted ${featured ? 'md:text-lg' : ''}`}>{m.summary}</p>
                {m.shot && m.live && (
                  <div className="relative mt-6">
                    <Safari
                      src={m.shot}
                      url={m.live.replace(/^https:\/\//, '')}
                      alt={`Screenshot of ${m.title}`}
                      sizes={featured ? '(min-width: 1024px) 720px, 100vw' : '(min-width: 1024px) 340px, (min-width: 768px) 50vw, 100vw'}
                      className="transition-transform duration-300 group-hover:-translate-y-1"
                    />
                    {slug === 'securescan' && (
                      // Findings popping in over the screenshot, like a scan running.
                      <div className="absolute bottom-3 right-3 hidden w-72 sm:block" aria-hidden="true">
                        <AnimatedList>
                          {scanFeed.map(([level, text]) => (
                            <span key={text} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface/95 px-3 py-2 font-mono text-[11px] text-fg shadow-lg shadow-black/30">
                              <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${SEVERITY[level]}`}>{level}</span>
                              <span className="truncate">{text}</span>
                            </span>
                          ))}
                        </AnimatedList>
                      </div>
                    )}
                  </div>
                )}
                {/* Pinned to the bottom so every card in a row lines up. */}
                <div className="mt-auto pt-6">
                  {featured ? (
                    // The wide tile has room to spare: show each result as its own cell.
                    <ul className="grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-4">
                      {m.outcome.split('·').map((o) => (
                        <li key={o} className="rounded-lg border border-line bg-surface-2/60 px-3 py-2.5 font-mono text-[12px] leading-snug text-fg">
                          {o.trim()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="border-t border-line pt-4 font-mono text-[13px] text-fg">{m.outcome}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.stack.map((s) => (
                      <span key={s} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 flex justify-end text-sm text-muted transition-colors group-hover:text-fg" aria-hidden="true">
                    <span className="transition-transform group-hover:translate-x-1">Read case study →</span>
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
