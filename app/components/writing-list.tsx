'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { TrackTag } from './track'
import type { Track } from '@/lib/content'

export type WritingItem = { slug: string; title: string; summary: string; date: string; dateTime: string; track: Track }

/*
  Post list with a sliding highlight bar and a preview card, adapted from Hyperiux's
  Interactive List Preview (21st.dev) without GSAP: CSS transitions do the easing and
  one small animation loop eases the preview after the pointer. The active row inverts
  (fg background, bg text) in both themes. Touch screens get the plain list.
*/
export function WritingList({ items }: { items: WritingItem[] }) {
  const [active, setActive] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fine = useRef(false)
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    fine.current = matchMedia('(pointer: fine)').matches
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine.current || still) return
    // Ease the preview a few pixels towards the pointer (the original's parallax).
    const now = { x: 0, y: 0 }
    let frame = requestAnimationFrame(function tick() {
      now.x += (target.current.x - now.x) * 0.18
      now.y += (target.current.y - now.y) * 0.18
      previewRef.current?.style.setProperty('translate', `${now.x.toFixed(2)}px ${now.y.toFixed(2)}px`)
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const activate = (i: number, row: HTMLElement) => {
    if (!fine.current || !listRef.current) return
    // The bar and the preview line up with the row through CSS variables.
    listRef.current.style.setProperty('--row-y', `${row.offsetTop}px`)
    listRef.current.style.setProperty('--row-h', `${row.offsetHeight}px`)
    setActive(i)
  }

  return (
    <ul
      ref={listRef}
      data-active={active !== null || undefined}
      onMouseLeave={() => setActive(null)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        target.current = { x: ((e.clientX - r.left) / r.width - 0.5) * 20, y: ((e.clientY - r.top) / r.height - 0.5) * 20 }
      }}
      className="writing-list relative -mx-4 divide-y divide-line border-y border-line"
    >
      <li className="writing-bar" aria-hidden="true" />
      {items.map((p, i) => (
        <li key={p.slug} data-active={active === i || undefined} className="writing-row relative z-10">
          <Link
            href={`/blog/${p.slug}`}
            onMouseEnter={(e) => activate(i, e.currentTarget.parentElement!)}
            onFocus={(e) => activate(i, e.currentTarget.parentElement!)}
            onBlur={() => setActive(null)}
            className="group grid justify-items-start gap-2 px-4 py-6 md:grid-cols-[140px_1fr_auto] md:items-baseline md:gap-8"
          >
            <time dateTime={p.dateTime} className="font-mono text-xs text-muted">
              {p.date}
            </time>
            <span>
              <span className="text-xl font-semibold tracking-tight">{p.title}</span>
              <span className="mt-1 block text-muted">{p.summary}</span>
            </span>
            <TrackTag track={p.track} />
          </Link>
        </li>
      ))}
      <li className="writing-preview" aria-hidden="true">
        <div ref={previewRef} className="writing-preview-inner">
          {items.map((p, i) => (
            // The post's own Open Graph card, served by /og on this site.
            <img
              key={p.slug}
              src={`/og?title=${encodeURIComponent(p.title)}&kicker=Writing`}
              alt=""
              width={1200}
              height={630}
              loading="lazy"
              data-active={active === i || undefined}
            />
          ))}
        </div>
      </li>
    </ul>
  )
}
