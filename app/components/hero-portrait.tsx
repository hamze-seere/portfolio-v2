import Image from 'next/image'
import { site } from '@/lib/site'

/* Hero photo: indigo-navy backdrop at night, white backdrop by day. CSS shows the one
   that matches <html data-theme>, so it swaps with no flash. The day photo is lazy:
   while it is hidden the browser never downloads it. */
export function HeroPortrait() {
  return (
    <>
      <Image
        src={site.portrait}
        alt={`Portrait of ${site.name}`}
        fill
        priority
        sizes="(min-width: 1024px) 46vw, 100vw"
        className="hero-portrait portrait-night object-cover object-[50%_15%]"
      />
      <Image
        src={site.portraitDay}
        alt={`Portrait of ${site.name}`}
        fill
        loading="lazy"
        sizes="(min-width: 1024px) 46vw, 100vw"
        className="hero-portrait portrait-day object-cover object-[50%_15%]"
      />
    </>
  )
}
