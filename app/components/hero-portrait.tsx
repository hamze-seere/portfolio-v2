'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { site } from '@/lib/site'
import type { Theme } from './theme-toggle'

/* Hero photo: dark studio backdrop at night, white backdrop by day. Only the current
   theme's photo is rendered (so only one is downloaded); it follows the theme toggle
   by watching <html data-theme>. */
export function HeroPortrait({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    const html = document.documentElement
    const sync = () => setTheme(html.dataset.theme === 'light' ? 'light' : 'dark')
    const observer = new MutationObserver(sync)
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return (
    <Image
      key={theme}
      src={theme === 'light' ? site.portraitDay : site.portrait}
      alt={`Portrait of ${site.name}`}
      fill
      priority
      sizes="(min-width: 1024px) 46vw, 100vw"
      className="hero-portrait object-cover object-[50%_15%]"
    />
  )
}
