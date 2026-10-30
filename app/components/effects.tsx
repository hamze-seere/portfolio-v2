'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/*
  Page-wide progressive enhancements, driven by data attributes in the markup:
  - [data-reveal]     sections ease in once when scrolled into view
  - [data-count]      numbers count up from 0 when first visible
  - [data-spotlight]  a glow follows the cursor, with a slight 3D tilt
  - [data-offscreen]  set on page sections out of view; CSS pauses their
                      looping animations so off-screen effects cost nothing
  Elements are only hidden *after* this script runs, so without JavaScript
  everything is simply visible. Reduced motion disables all of it.
*/
export function Effects({ reveal, spotlight }: { reveal: boolean; spotlight: boolean }) {
  const pathname = usePathname()

  // Scroll reveals + count-up. Re-run per route so new pages get wired up.
  useEffect(() => {
    if (!reveal || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sections = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')]
    const counters = [...document.querySelectorAll<HTMLElement>('[data-count]:not([data-counted])')]
    sections.forEach((el) => el.classList.add('reveal-pending'))

    const countUp = (el: HTMLElement) => {
      el.dataset.counted = ''
      const final = el.textContent ?? ''
      const match = final.match(/\d+/)
      if (!match) return
      const target = Number(match[0])
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 1100)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = final.replace(match[0], String(Math.round(target * eased)))
        if (p < 1) requestAnimationFrame(step)
        else el.textContent = final
      }
      requestAnimationFrame(step)
      // Animation frames pause in background tabs; always land on the real number.
      setTimeout(() => (el.textContent = final), 1300)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const el = e.target as HTMLElement
          if (el.hasAttribute('data-count')) countUp(el)
          else {
            el.classList.remove('reveal-pending')
            el.dataset.revealed = ''
          }
          io.unobserve(el)
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    sections.forEach((el) => io.observe(el))
    counters.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      // Never leave content hidden if this effect is torn down mid-way.
      sections.forEach((el) => el.classList.remove('reveal-pending'))
    }
  }, [reveal, pathname])

  // Pause looping animations in sections that are scrolled out of view.
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('main section, footer')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement
          if (e.isIntersecting) el.removeAttribute('data-offscreen')
          else el.setAttribute('data-offscreen', '')
        }
      },
      { rootMargin: '150px 0px' },
    )
    sections.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      sections.forEach((el) => el.removeAttribute('data-offscreen'))
    }
  }, [pathname])

  // Spotlight + tilt, delegated so it covers cards on every page.
  useEffect(() => {
    if (!spotlight || !matchMedia('(pointer: fine)').matches) return
    const tilt = !matchMedia('(prefers-reduced-motion: reduce)').matches
    let active: HTMLElement | null = null

    const reset = (el: HTMLElement) => {
      el.removeAttribute('data-spot-on')
      el.style.removeProperty('transform')
    }
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-spotlight]')
      if (active && active !== el) reset(active)
      active = el
      if (!el) return
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      el.setAttribute('data-spot-on', '')
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
      if (tilt) {
        const rx = ((y / r.height) - 0.5) * -3 // max ±1.5°
        const ry = ((x / r.width) - 0.5) * 3
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      }
    }
    const onLeave = () => active && reset(active)
    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [spotlight])

  return null
}
