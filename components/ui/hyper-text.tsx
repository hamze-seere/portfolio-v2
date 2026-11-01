'use client'
// Magic UI — Hyper Text (magicui.design/r/hyper-text.json).
// Adapted: keeps the text's own case and font (no forced uppercase/mono), sizes itself
// from the real word so scrambled letters never shift the layout, drops the per-letter
// motion spans (plain text, no motion import), and skips the scramble for reduced motion.
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

interface HyperTextProps {
  children: string
  className?: string
  /** Duration of the scramble in milliseconds */
  duration?: number
  /** Delay before the first scramble in milliseconds */
  delay?: number
  /** Scramble again when the pointer enters (or the parent link is hovered/focused) */
  animateOnHover?: boolean
}

export function HyperText({ children, className, duration = 700, delay = 0, animateOnHover = true }: HyperTextProps) {
  const [text, setText] = useState(children)
  const frame = useRef<number | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const run = useCallback(() => {
    if (frame.current !== null || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    const tick = (now: number) => {
      const done = Math.min(1, (now - start) / duration) * children.length
      setText(
        children
          .split('')
          .map((c, i) => (c === ' ' || i < done ? c : LETTERS[Math.floor(Math.random() * LETTERS.length)]))
          .join(''),
      )
      if (done < children.length) frame.current = requestAnimationFrame(tick)
      else {
        frame.current = null
        setText(children)
      }
    }
    frame.current = requestAnimationFrame(tick)
  }, [children, duration])

  useEffect(() => {
    const t = setTimeout(run, delay)
    return () => {
      clearTimeout(t)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [run, delay])

  // Hovering or focusing the surrounding link replays it, not just the word itself.
  useEffect(() => {
    const host = animateOnHover ? (ref.current?.closest('a, button') ?? ref.current) : null
    if (!host) return
    host.addEventListener('pointerenter', run)
    host.addEventListener('focus', run)
    return () => {
      host.removeEventListener('pointerenter', run)
      host.removeEventListener('focus', run)
    }
  }, [animateOnHover, run])

  return (
    <span ref={ref} className={cn('relative inline-grid', className)}>
      {/* The real word sets the width; the scrambled copy is drawn over it. */}
      <span className="invisible col-start-1 row-start-1">{children}</span>
      <span aria-hidden="true" className="col-start-1 row-start-1 overflow-hidden whitespace-nowrap">
        {text}
      </span>
      <span className="sr-only">{children}</span>
    </span>
  )
}
