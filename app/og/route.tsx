import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

/* Dynamic Open Graph image — from the portfolio starter, restyled to the site. */
export function GET(request: Request) {
  const url = new URL(request.url)
  const title = (url.searchParams.get('title') || site.role).slice(0, 120)
  const kicker = (url.searchParams.get('kicker') || site.name).slice(0, 40)

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full justify-between p-20" style={{
          backgroundColor: '#07061a',
          backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.35), transparent 55%), radial-gradient(circle at 100% 70%, rgba(37, 99, 235, 0.28), transparent 55%)',
          color: '#f2f1fb',
        }}>
        <div tw="flex items-center text-3xl" style={{ color: '#9d9abd' }}>
          <span style={{ color: '#a78bfa' }}>■</span>
          <span tw="ml-2" style={{ color: '#60a5fa' }}>■</span>
          <span tw="ml-5">{kicker}</span>
        </div>
        <div tw="flex text-7xl font-bold leading-tight" style={{ letterSpacing: '-0.03em' }}>
          {title}
        </div>
        <div tw="flex justify-between text-3xl" style={{ color: '#9d9abd' }}>
          <span>{site.name}</span>
          <span>Security · Web</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
