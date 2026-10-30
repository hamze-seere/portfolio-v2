// Magic UI — Shine Border (magicui.design/r/shine-border.json).
// Adapted for performance: the original animates background-position, which
// repaints the gradient every frame. Here the same 300% gradient sits on an
// inner layer that slides with transform (compositor-only); the outer mask
// still limits it to the border ring. Same look, no per-frame paint.
import * as React from 'react'

import { cn } from '@/lib/utils'

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the border in pixels */
  borderWidth?: number
  /** Duration of the animation in seconds */
  duration?: number
  /** Color of the border, can be a single color or an array of colors */
  shineColor?: string | string[]
}

export function ShineBorder({ borderWidth = 1, duration = 14, shineColor = '#000000', className, style, ...props }: ShineBorderProps) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          '--border-width': `${borderWidth}px`,
          '--duration': `${duration}s`,
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: 'var(--border-width)',
          ...style,
        } as React.CSSProperties
      }
      className={cn('pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[inherit]', className)}
      {...props}
    >
      <div
        className="motion-safe:animate-shine absolute left-0 top-0 h-[300%] w-[300%] will-change-transform"
        style={{
          backgroundImage: `radial-gradient(transparent,transparent, ${Array.isArray(shineColor) ? shineColor.join(',') : shineColor},transparent,transparent)`,
        }}
      />
    </div>
  )
}
