// Magic UI — Border Beam (magicui.design/r/border-beam.json).
// Adapted: runs as a CSS animation (Magic UI's earlier version) instead of a
// Motion JS loop, so it costs no script per frame and pauses off-screen with
// the rest of the page's CSS animations; hidden for reduced motion.
import { cn } from '@/lib/utils'

interface BorderBeamProps {
  /** The size of the border beam. */
  size?: number
  /** The duration of the border beam. */
  duration?: number
  /** The delay of the border beam. */
  delay?: number
  /** The color of the border beam from. */
  colorFrom?: string
  /** The color of the border beam to. */
  colorTo?: string
  className?: string
  style?: React.CSSProperties
  /** Whether to reverse the animation direction. */
  reverse?: boolean
  /** The initial offset position (0-100). */
  initialOffset?: number
  /** The border width of the beam. */
  borderWidth?: number
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box] motion-reduce:hidden"
      style={{ '--border-beam-width': `${borderWidth}px` } as React.CSSProperties}
    >
      <div
        className={cn('animate-border-beam absolute aspect-square', 'bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent', className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            '--beam-from': `${reverse ? 100 - initialOffset : initialOffset}%`,
            '--beam-to': `${reverse ? -initialOffset : 100 + initialOffset}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${-delay}s`,
            ...style,
          } as React.CSSProperties
        }
      />
    </div>
  )
}
