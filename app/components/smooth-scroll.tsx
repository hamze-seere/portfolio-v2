'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/*
  Smooth wheel scrolling (Lenis): each mouse-wheel notch eases into place instead of
  jumping. Mouse and trackpad only: touch screens already scroll smoothly by themselves,
  and reduced motion keeps the browser's own scrolling. The page still scrolls natively
  underneath, so sticky, scroll-driven CSS and Ctrl+F all behave as before.
*/
let lenis: Lenis | null = null

/** Glide to an element, through Lenis when it is running (Effects uses this for /#links). */
export function scrollToElement(el: HTMLElement) {
  // Lenis honours the html scroll-padding-top that clears the nav, like scrollIntoView does.
  if (lenis) lenis.scrollTo(el)
  else el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}

export function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ autoRaf: true, lerp: 0.12, stopInertiaOnNavigate: true })
    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [])
  return null
}
