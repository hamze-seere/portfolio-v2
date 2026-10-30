import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackTag } from '../components/track'
import { BlurFade } from '@/components/ui/blur-fade'
import { formatDate, getPosts, readingTime } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Notes on application security, web development and where they overlap.',
}

export default function BlogIndex() {
  const posts = getPosts()
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
      <BlurFade>
        <p className="label">Writing</p>
      </BlurFade>
      <BlurFade delay={0.08}>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Notes from both sides.</h1>
      </BlurFade>
      <BlurFade delay={0.16}>
        <p className="mt-5 text-lg text-muted">
          Application security, web development, and where they overlap.{' '}
          <Link href="/rss" className="text-web hover:underline">
            Subscribe via RSS
          </Link>
          .
        </p>
      </BlurFade>
      <ul className="mt-14 divide-y divide-line border-y border-line">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <BlurFade delay={0.28 + i * 0.1} offset={12}>
            <Link href={`/blog/${p.slug}`} className="group block py-8">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                <time dateTime={p.metadata.publishedAt}>{formatDate(p.metadata.publishedAt)}</time>
                <span>·</span>
                <span>{readingTime(p.content)} min read</span>
                <TrackTag track={p.metadata.track} />
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">{p.metadata.title}</h2>
              <p className="mt-2 text-muted">{p.metadata.summary}</p>
            </Link>
            </BlurFade>
          </li>
        ))}
      </ul>
    </div>
  )
}
