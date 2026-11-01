// Magic UI — Confetti (magicui.design/r/confetti.json).
// Adapted: the original wraps the canvas-confetti package; this is a ~60-line
// version with no dependency. It costs nothing until it is fired: the canvas is
// created on demand, animates for about two seconds, then removes itself.
// Skipped entirely for visitors who ask for reduced motion.

const COLORS = ['#ff7847', '#f2906b', '#b49be0', '#7d95ff', '#4ade80']

export function fireConfetti(from?: HTMLElement | null) {
  if (typeof window === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const canvas = document.createElement('canvas')
  const dpr = Math.min(devicePixelRatio || 1, 2)
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:100'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.remove()
  ctx.scale(dpr, dpr)

  // Burst from the centre of the element (or the screen), upwards and outwards.
  const r = from?.getBoundingClientRect()
  const ox = r ? r.left + r.width / 2 : innerWidth / 2
  const oy = r ? r.top + r.height / 2 : innerHeight / 2
  const bits = Array.from({ length: 90 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
    const speed = 7 + Math.random() * 7
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      spin: Math.random() * Math.PI,
      vs: (Math.random() - 0.5) * 0.3,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    }
  })

  const start = performance.now()
  const frame = (now: number) => {
    const t = now - start
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    ctx.globalAlpha = Math.max(0, 1 - t / 2200)
    for (const b of bits) {
      b.vx *= 0.985
      b.vy = b.vy * 0.985 + 0.28
      b.x += b.vx
      b.y += b.vy
      b.spin += b.vs
      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(b.spin)
      ctx.fillStyle = b.color
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h)
      ctx.restore()
    }
    if (t < 2200) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
