import type { Metadata } from 'next'
import { WorkGrid } from '../components/work-grid'
import { BlurFade } from '@/components/ui/blur-fade'
import { getWork } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Security assessments and web builds — case studies with the problem, the work and the result.',
}

export default function WorkIndex() {
  const work = getWork()
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <BlurFade>
        <p className="label">Work</p>
      </BlurFade>
      <BlurFade delay={0.08}>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Case studies from both sides of the stack.</h1>
      </BlurFade>
      <BlurFade delay={0.16}>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Security tools, hardened builds and hands-on labs — each with links to the source on GitHub.
        </p>
      </BlurFade>
      <BlurFade delay={0.28} offset={14} className="mt-14">
        <WorkGrid items={work.map(({ slug, metadata }) => ({ slug, metadata }))} />
      </BlurFade>
    </div>
  )
}
