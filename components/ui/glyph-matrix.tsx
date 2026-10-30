'use client'

// Magic UI — Glyph Matrix (magicui.design/r/glyph-matrix.json).
// Adapted: for reduced motion it draws one still frame and never ticks; ticks
// repaint only changed cells and pause while off-screen (see tick below).
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface GlyphMatrixProps extends React.HTMLAttributes<HTMLCanvasElement> {
  /** Characters to randomly pick from */
  glyphs?: string
  /** Cell size in px (also font size) */
  cellSize?: number
  /** Probability (0-1) a cell mutates each tick */
  mutationRate?: number
  /** Tick interval in ms */
  interval?: number
  /** Fade out toward bottom (0 = no fade) */
  fadeBottom?: number
  /** Glyph color (any CSS color). Pass a theme-aware value from the consumer. */
  color?: string
}

/**
 * GlyphMatrix — an animated grid of subtly shifting glyphs.
 * Pass a `color` prop to adapt it to light and dark modes.
 */
export function GlyphMatrix({
  glyphs = '01·•+*/\\<>=',
  cellSize = 14,
  mutationRate = 0.04,
  interval = 90,
  className,
  fadeBottom = 0.6,
  color = '#6B7280',
  style,
  ...props
}: GlyphMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Current glyph color as RGBA (a in 0-1). Kept in a ref so a color change
  // (e.g. theme toggle) recolors the next frame without restarting.
  const rgbaRef = useRef({ r: 107, g: 114, b: 128, a: 1 })
  const redrawRef = useRef<() => void>(() => {})

  // Resolve the CSS color string to RGBA (handles hex, rgb, hsl, oklch, ...).
  useEffect(() => {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
    const probeCtx = probe.getContext('2d')
    if (!probeCtx) return
    // Seed with the default so an invalid color falls back to it.
    probeCtx.fillStyle = '#6B7280'
    probeCtx.fillStyle = color
    probeCtx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data
    rgbaRef.current = { r, g, b, a: a / 255 }
    redrawRef.current()
  }, [color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cols = 0
    let rows = 0
    let cells: string[] = []
    let alphas: number[] = []
    let raf = 0
    let last = 0
    let stopped = false

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { clientWidth: w, clientHeight: h } = canvas

      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(w / cellSize)
      rows = Math.ceil(h / cellSize)

      cells = new Array(cols * rows).fill(0).map(() => glyphs[Math.floor(Math.random() * glyphs.length)])
      alphas = new Array(cols * rows).fill(0).map(() => 0.05 + Math.random() * 0.35)
    }

    const paintCell = (i: number) => {
      const x = i % cols
      const y = (i - x) / cols
      const { r, g, b, a: colorAlpha } = rgbaRef.current
      const fade = fadeBottom > 0 ? 1 - (y / rows) * fadeBottom : 1
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alphas[i] * fade * colorAlpha})`
      ctx.fillText(cells[i], x * cellSize, y * cellSize)
    }

    const draw = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      ctx.clearRect(0, 0, w, h)

      ctx.font = `${cellSize - 2}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textBaseline = 'top'

      for (let i = 0; i < cols * rows; i++) paintCell(i)
    }
    redrawRef.current = draw

    // Adapted for performance: a tick repaints only the cells that changed
    // (not the whole canvas), and ticking stops while the canvas is off-screen
    // or the tab is hidden.
    const tick = (t: number) => {
      if (stopped) return

      if (t - last >= interval) {
        last = t

        const total = cols * rows
        const mutations = Math.max(1, Math.floor(total * mutationRate))

        for (let n = 0; n < mutations; n++) {
          const i = Math.floor(Math.random() * total)
          cells[i] = glyphs[Math.floor(Math.random() * glyphs.length)]
          alphas[i] = 0.05 + Math.random() * 0.45
          const x = i % cols
          ctx.clearRect(x * cellSize, ((i - x) / cols) * cellSize, cellSize, cellSize)
          paintCell(i)
        }
      }

      raf = requestAnimationFrame(tick)
    }

    let onScreen = true
    const sync = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!still && onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(tick)
    }

    resize()
    draw()
    sync()

    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      redrawRef.current = () => {}
    }
  }, [glyphs, cellSize, mutationRate, interval, fadeBottom])

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none', className)}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      aria-hidden="true"
      {...props}
    />
  )
}
