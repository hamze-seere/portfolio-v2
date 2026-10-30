// Magic UI — Safari (magicui.design/r/safari.json).
// Adapted: the original draws the window chrome as a large inline SVG; this is the
// same look in a few divs, and the screenshot goes through next/image so it is
// lazy-loaded, resized for the card and served as AVIF/WebP from our own origin.
import Image from 'next/image'

import { cn } from '@/lib/utils'

interface SafariProps {
  src: string
  /** Address shown in the bar, without the protocol. */
  url: string
  alt: string
  sizes: string
  className?: string
}

export function Safari({ src, url, alt, sizes, className }: SafariProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface-2 shadow-lg shadow-black/20', className)}>
      <div className="flex items-center gap-3 border-b border-line px-3 py-2" aria-hidden="true">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto max-w-[70%] truncate rounded-md bg-bg/60 px-3 py-0.5 font-mono text-[11px] text-muted">{url}</span>
        <span className="w-[42px]" />
      </div>
      <Image src={src} alt={alt} width={1280} height={800} sizes={sizes} className="block h-auto w-full" />
    </div>
  )
}
