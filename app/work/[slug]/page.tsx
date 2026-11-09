import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'
import { CustomMDX } from '@/app/components/mdx'
import { JsonLd } from '@/app/components/json-ld'
import { TrackTag } from '@/app/components/track'
import { getWork } from '@/lib/content'
import { baseUrl, site } from '@/lib/site'
import { features } from '@/lib/features'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getWork().map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = getWork().find((x) => x.slug === slug)
  if (!item) return {}
  const og = `/og?title=${encodeURIComponent(item.metadata.title)}&kicker=${encodeURIComponent('Case study')}`
  return {
    title: item.metadata.title,
    description: item.metadata.summary,
    openGraph: { title: item.metadata.title, description: item.metadata.summary, url: `${baseUrl}/work/${slug}`, images: [og] },
    twitter: { card: 'summary_large_image', images: [og] },
  }
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params
  const all = getWork()
  const i = all.findIndex((w) => w.slug === slug)
  if (i < 0) notFound()
  const { metadata: m, content } = all[i]
  const next = all[(i + 1) % all.length]

  const facts: [string, React.ReactNode][] = [
    ['Client', m.client],
    ['Role', m.role],
    ['Year', m.year],
    ['Stack', m.stack.join(', ')],
  ]

  return (
    <article className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CreativeWork', name: m.title, description: m.summary, dateCreated: m.year, author: { '@type': 'Person', name: site.name }, url: `${baseUrl}/work/${slug}` }} />
      <Link prefetch href="/work" className="text-sm text-muted hover:text-fg">
        ← All work
      </Link>
      <header
        data-track={m.track}
        className={`relative mt-8 overflow-hidden rounded-2xl border border-line px-6 pb-12 pt-10 md:px-10 ${features.trackColors ? 'track-tint' : ''}`}
      >
        {features.trackColors && <span className="track-bar" data-track={m.track} aria-hidden="true" />}
        <TrackTag track={m.track} />
        <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">
          {features.pageTransitions ? (
            <ViewTransition name={`work-title-${slug}`} share="morph" default="none">
              <span className="inline-block">{m.title}</span>
            </ViewTransition>
          ) : (
            m.title
          )}
        </h1>
        <p className="mt-5 max-w-3xl text-xl leading-relaxed text-muted">{m.summary}</p>
        <p className="mt-8 inline-block rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium">
          <span className="text-ok">Result:</span> {m.outcome}
        </p>
        {(m.live || m.repo) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {m.live && (
              <a href={m.live} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-fg px-5 py-3 font-medium text-bg transition-opacity hover:opacity-85">
                Open live demo ↗
              </a>
            )}
            {m.repo && (
              <a href={m.repo} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-line bg-surface px-5 py-3 font-medium transition-colors hover:border-muted/60">
                View source on GitHub ↗
              </a>
            )}
          </div>
        )}
        {m.repos.length > 0 && (
          <div className="mt-8">
            <p className="label">Repositories</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.repos.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm transition-colors hover:border-muted/60"
                  >
                    <span>{r.label}</span>
                    <span className="text-muted" aria-hidden="true">
                      GitHub ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <div className="mt-12 grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside>
          <dl className="space-y-5 lg:sticky lg:top-24">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className="prose max-w-[68ch]">
          <CustomMDX source={content} />
        </div>
      </div>
      <nav aria-label="Next case study" className="mt-20 border-t border-line pt-10">
        <Link prefetch href={`/work/${next.slug}`} className="group block">
          <span className="label">Next case study</span>
          <span className="mt-2 block text-3xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">{next.metadata.title} →</span>
        </Link>
      </nav>
    </article>
  )
}
