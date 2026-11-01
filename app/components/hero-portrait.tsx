import Image from 'next/image'
import { site } from '@/lib/site'

/* Hero photo on its indigo-navy backdrop. */
export function HeroPortrait() {
  return (
    <Image
      src={site.portrait}
      alt={`Portrait of ${site.name}`}
      fill
      priority
      sizes="(min-width: 1024px) 46vw, 100vw"
      className="hero-portrait object-cover object-[50%_15%]"
    />
  )
}
