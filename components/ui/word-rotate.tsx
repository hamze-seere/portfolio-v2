'use client'

// Magic UI — Word Rotate (magicui.design/r/word-rotate.json).
// Adapted for performance: a CSS keyframe instead of an animation library, the timer
// pauses while the tab is hidden, and for reduced motion the first word just stays.
// Screen readers get every word once instead of a changing one.
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface WordRotateProps {
  words: readonly string[]
  /** Milliseconds each word stays. */
  duration?: number
  className?: string
}

export function WordRotate({ words, duration = 2600, className }: WordRotateProps) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % words.length)
    }, duration)
    return () => clearInterval(timer)
  }, [words.length, duration])

  return (
    <span className={cn('inline-flex overflow-hidden', className)}>
      <span className="sr-only">{words.join(', ')}</span>
      <span key={i} className="word-rotate-item" aria-hidden="true">
        {words[i]}
      </span>
    </span>
  )
}
