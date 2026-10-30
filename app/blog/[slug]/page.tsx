import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CustomMDX } from '@/app/components/mdx'
import { JsonLd } from '@/app/components/json-ld'
import { TrackTag } from '@/app/components/track'
import { formatDate, getPosts, readingTime } from '@/lib/content'
import { baseUrl, site } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPosts().find((p) => p.slug === slug)
  if (!post) return {}
  const { title, summary: description, publishedAt: publishedTime } = post.metadata
  const og = `/og?title=${encodeURIComponent(title)}&kicker=${encodeURIComponent('Writing')}`
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', publishedTime, url: `${baseUrl}/blog/${slug}`, images: [og] },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  }
}

export default async function Post({ params }: Props) {
  const { slug } = await params
  const post = getPosts().find((p) => p.slug === slug)
  if (!post) notFound()
  const { metadata: m, content } = post

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: m.title,
          datePublished: m.publishedAt,
          dateModified: m.publishedAt,
          description: m.summary,
          image: `${baseUrl}/og?title=${encodeURIComponent(m.title)}`,
          url: `${baseUrl}/blog/${slug}`,
          author: { '@type': 'Person', name: site.name },
        }}
      />
      <Link href="/blog" className="text-sm text-muted hover:text-fg">
        ← All writing
      </Link>
      <header className="mt-8 border-b border-line pb-10">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
          <time dateTime={m.publishedAt}>{formatDate(m.publishedAt)}</time>
          <span>·</span>
          <span>{readingTime(content)} min read</span>
          <TrackTag track={m.track} />
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{m.title}</h1>
        <p className="mt-4 text-xl text-muted">{m.summary}</p>
      </header>
      <div className="prose mt-10">
        <CustomMDX source={content} />
      </div>
      <aside className="mt-16 rounded-2xl border border-line bg-surface p-7">
        <p className="font-semibold">Need this applied to your product?</p>
        <p className="mt-1 text-muted">I run security reviews and build hardened web apps.</p>
        <Link href="/#contact" className="mt-4 inline-block rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-bg hover:opacity-85">
          Get in touch
        </Link>
      </aside>
    </article>
  )
}
