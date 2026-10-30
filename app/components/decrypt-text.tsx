'use client'

import { useEffect, useState } from 'react'

const GLYPHS = '!#$%&*+/<=>?@[]{}~0123456789ABCDEFabcdef'

/*
  Text that "decrypts" into place on load: every letter starts as a random glyph
  and locks in left to right. Screen readers and search engines get the real text
  (the animated copy is aria-hidden), and the server render is already the real
  text, so nothing is lost without JavaScript or with reduced motion.
*/
export function DecryptText({ text, delay = 0, duration = 900 }: { text: string; delay?: number; duration?: number }) {
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const scramble = (resolved: number) =>
      [...text].map((ch, i) => (i < resolved || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('')

    setShown(scramble(0))
    let raf = 0
    let start = 0
    let lastSwap = 0
    const tick = (now: number) => {
      if (!start) start = now + delay
      const t = Math.max(0, now - start)
      const resolved = Math.floor((t / duration) * text.length)
      // Re-roll the unresolved glyphs ~30 times a second, not every frame.
      if (now - lastSwap > 33 || resolved >= text.length) {
        setShown(scramble(resolved))
        lastSwap = now
      }
      if (resolved < text.length) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // Safety net: animation frames pause in background tabs, so never leave the
    // headline scrambled — show the real text once the animation should be done.
    const done = setTimeout(() => {
      cancelAnimationFrame(raf)
      setShown(text)
    }, delay + duration + 400)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(done)
    }
  }, [text, delay, duration])

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{text}</span>
    </>
  )
}
