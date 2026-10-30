'use client'

// Magic UI — Animated List (magicui.design/r/animated-list.json).
// Adapted for performance: no animation library (a CSS keyframe pops each new item
// in), the timer only runs while the list is on screen, and for reduced motion the
// list just shows its first items without cycling.
import { Children, useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface AnimatedListProps {
  children: ReactNode
  /** Milliseconds between new items. */
  delay?: number
  /** How many items are visible at once. */
  visible?: number
  className?: string
}

export function AnimatedList({ children, delay = 1800, visible = 3, className }: AnimatedListProps) {
  const items = Children.toArray(children)
  const [tick, setTick] = useState(visible - 1)
  const root = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setInterval> | undefined
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer)
      if (e.isIntersecting) timer = setInterval(() => setTick((t) => t + 1), delay)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      clearInterval(timer)
    }
  }, [delay])

  // Newest first; the counter keeps growing so every new item gets a fresh key (and animation).
  const shown = Array.from({ length: Math.min(visible, items.length) }, (_, i) => tick - i)
  return (
    <ul ref={root} className={cn('flex flex-col gap-2', className)}>
      {shown.map((n) => (
        <li key={n} className="animated-list-item">
          {items[n % items.length]}
        </li>
      ))}
    </ul>
  )
}
