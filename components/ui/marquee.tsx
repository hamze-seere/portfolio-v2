// Magic UI — Marquee (magicui.design/r/marquee.json).
// Adapted: repeated copies are aria-hidden so screen readers hear the list once.
import { type ComponentPropsWithoutRef } from 'react'

import { cn } from '@/lib/utils'

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  /** Whether to reverse the animation direction */
  reverse?: boolean
  /** Whether to pause the animation on hover */
  pauseOnHover?: boolean
  children: React.ReactNode
  /** Whether to animate vertically instead of horizontally */
  vertical?: boolean
  /** Number of times to repeat the content */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'marquee group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 || undefined}
            data-copy={i > 0 || undefined}
            className={cn('flex shrink-0 justify-around gap-(--gap)', {
              'animate-marquee flex-row': !vertical,
              'animate-marquee-vertical flex-col': vertical,
              'group-hover:[animation-play-state:paused]': pauseOnHover,
              '[animation-direction:reverse]': reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
