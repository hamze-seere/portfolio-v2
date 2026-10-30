'use client'

import { createRef, useRef } from 'react'
import { useInView } from 'motion/react'
import { AnimatedBeam } from '@/components/ui/animated-beam'

type Step = readonly [n: string, title: string, detail: string]

/* "How I work": the four steps, with Magic UI Animated Beams relaying light
   along the top edge from one step to the next (wide screens only, where the
   steps sit in one row). */
export function MethodFlow({ steps, beams }: { steps: readonly Step[]; beams: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // The beams animate from script every frame, so only mount them on screen.
  const inView = useInView(containerRef, { margin: '150px 0px' })
  const anchors = useRef(steps.map(() => createRef<HTMLSpanElement>())).current
  const mix = (t: number) => `color-mix(in srgb, var(--web) ${Math.round(t * 100)}%, var(--sec))`
  const last = steps.length - 1

  return (
    <div ref={containerRef} className="relative">
      <ol className="method-flow grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([n, t, d], i) => (
          <li key={n} className="relative bg-surface p-7" style={{ '--t': i / last } as React.CSSProperties}>
            <span ref={anchors[i]} className="absolute left-8 top-0 h-px w-px" aria-hidden="true" />
            <span className="flex items-center gap-3">
              <span className="method-dot h-2 w-2 rounded-full" aria-hidden="true" />
              <span className="method-num font-mono text-sm font-semibold">{n}</span>
            </span>
            <h3 className="mt-8 text-xl font-semibold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
          </li>
        ))}
      </ol>
      {beams &&
        inView &&
        steps.slice(0, -1).map(([n], i) => (
          <AnimatedBeam
            key={n}
            className="hidden lg:block"
            containerRef={containerRef}
            fromRef={anchors[i]}
            toRef={anchors[i + 1]}
            pathOpacity={0}
            pathWidth={2}
            gradientStartColor={mix(i / last)}
            gradientStopColor={mix((i + 1) / last)}
            duration={2}
            delay={i}
            repeatDelay={1}
          />
        ))}
    </div>
  )
}
