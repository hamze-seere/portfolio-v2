'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, MotionConfig } from 'motion/react'

/*
  Primary links with a 21st.dev "Tubelight" indicator: a soft pill with a red → blue lamp
  on top glides (spring, shared layoutId) to whichever link you hover, and rests on the
  page or home-page section you are in. Reduced motion: it jumps instead of gliding.
*/
const links = [
  { href: '/#services', label: 'Services', section: 'services', always: false },
  { href: '/work', label: 'Work', always: true },
  { href: '/#experience', label: 'Timeline', section: 'experience', always: false },
  { href: '/blog', label: 'Writing', always: true },
]

export function NavLinks() {
  const pathname = usePathname()
  const [section, setSection] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  // On the home page, follow which linked section sits in the middle of the screen.
  // Sections are looked up on each check: the page streams in after the nav mounts.
  useEffect(() => {
    setSection(null)
    if (pathname !== '/') return
    let frame = 0
    const check = () => {
      frame = 0
      const mid = innerHeight / 2
      const hit = links.find((l) => {
        const r = l.section && document.querySelector(`section[aria-labelledby="${l.section}"]`)?.getBoundingClientRect()
        return r && r.top <= mid && r.bottom > mid
      })
      setSection(hit?.section ?? null)
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
  }, [pathname])

  const active = links.find((l) => (l.section ? pathname === '/' && section === l.section : pathname.startsWith(l.href)))?.href
  const lit = hovered ?? active

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex items-center gap-0.5" onPointerLeave={() => setHovered(null)}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.href === active ? (l.section ? 'location' : 'page') : undefined}
            onPointerEnter={() => setHovered(l.href)}
            onFocus={() => setHovered(l.href)}
            onBlur={() => setHovered(null)}
            className={`${l.always ? 'block' : 'hidden md:block'} relative isolate rounded-full px-2 py-1.5 transition-colors sm:px-3 ${l.href === lit ? 'text-fg' : 'text-muted'}`}
          >
            {l.href === lit && (
              <motion.span layoutId="tubelight" className="absolute inset-0 -z-10 rounded-full bg-surface-2" transition={{ type: 'spring', stiffness: 380, damping: 32 }} aria-hidden="true">
                <span className="tubelight-lamp absolute -top-[9px] left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-b-full" />
              </motion.span>
            )}
            {l.label}
          </Link>
        ))}
      </div>
    </MotionConfig>
  )
}
