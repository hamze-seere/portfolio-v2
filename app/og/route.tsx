import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

/* Dynamic Open Graph image — from the portfolio starter, restyled to the site. */
export function GET(request: Request) {
  const url = new URL(request.url)
  const title = (url.searchParams.get('title') || site.role).slice(0, 120)
  const kicker = (url.searchParams.get('kicker') || site.name).slice(0, 40)

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full justify-between p-20" style={{ background: '#121110', color: '#efece7' }}>
        <div tw="flex items-center text-3xl" style={{ color: '#a39e96' }}>
          <span style={{ color: '#ff7847' }}>■</span>
          <span tw="ml-2" style={{ color: '#7d95ff' }}>■</span>
          <span tw="ml-5">{kicker}</span>
        </div>
        <div tw="flex text-7xl font-bold leading-tight" style={{ letterSpacing: '-0.03em' }}>
          {title}
        </div>
        <div tw="flex justify-between text-3xl" style={{ color: '#a39e96' }}>
          <span>{site.name}</span>
          <span>Security · Web</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
