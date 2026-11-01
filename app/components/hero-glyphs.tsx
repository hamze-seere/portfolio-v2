'use client'

import { useEffect, useState } from 'react'
import { GlyphMatrix } from '@/components/ui/glyph-matrix'

/* Hero background: Magic UI's Glyph Matrix in the site's --muted colour. The
   canvas can't read CSS variables, so resolve it once on mount. */
export function HeroGlyphs() {
  const [color, setColor] = useState('')

  useEffect(() => {
    setColor(getComputedStyle(document.documentElement).getPropertyValue('--muted').trim())
  }, [])

  return (
    <div className="hero-glyphs pointer-events-none absolute inset-0" aria-hidden="true">
      {color && <GlyphMatrix color={color} cellSize={18} fadeBottom={0.9} mutationRate={0.02} interval={120} />}
    </div>
  )
}
