// Magic UI — Animated Shiny Text (magicui.design/r/animated-shiny-text.json).
// Adapted: neutral/dark: colours swapped for the site's --muted / --fg tokens,
// which already follow the day/night toggle.
import { type ComponentPropsWithoutRef, type CSSProperties, type FC } from 'react'

import { cn } from '@/lib/utils'

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<'span'> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({ children, className, shimmerWidth = 100, ...props }) => {
  return (
    <span
      style={{ '--shiny-width': `${shimmerWidth}px` } as CSSProperties}
      className={cn(
        'mx-auto max-w-md text-muted',

        // Shine effect
        'motion-safe:animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-position-[0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',

        // Shine gradient
        'bg-linear-to-r from-transparent via-fg/80 via-50% to-transparent',

        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
