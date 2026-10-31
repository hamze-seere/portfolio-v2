import { cookies } from 'next/headers'
import Link from 'next/link'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { BorderBeam } from '@/components/ui/border-beam'
import { Marquee } from '@/components/ui/marquee'
import { Meteors } from '@/components/ui/meteors'
import { ShineBorder } from '@/components/ui/shine-border'
import { TextAnimate } from '@/components/ui/text-animate'
import { WordRotate } from '@/components/ui/word-rotate'
import { ContactForm } from './components/contact-form'
import { CopyButton } from './components/copy-button'
import { DecryptText } from './components/decrypt-text'
import { features } from '@/lib/features'
import { HeroGlyphs } from './components/hero-glyphs'
import { HeroPortrait } from './components/hero-portrait'
import { MethodFlow } from './components/method-flow'
import { WorkGrid } from './components/work-grid'
import { WritingList } from './components/writing-list'
import { formatDate, getPosts, getWork } from '@/lib/content'
import { experience, focus, method, proof, services, site, stats, toolbox } from '@/lib/site'

function SectionHead({ id, kicker, title, children }: { id: string; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="label">{kicker}</p>
        <TextAnimate as="h2" id={id} animation="blurInUp" by="word" once className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          {title}
        </TextAnimate>
      </div>
      {children}
    </div>
  )
}

export default async function Home() {
  const theme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'
  const work = getWork()
  const posts = getPosts().slice(0, 3)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex flex-col overflow-hidden border-b border-line lg:block">
        {features.heroAura && (
          <div className="hero-aura pointer-events-none absolute inset-0" aria-hidden="true">
            <span className="hero-aura-sec" />
            <span className="hero-aura-web" />
          </div>
        )}
        {features.glyphMatrix ? <HeroGlyphs /> : <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />}
        <div className="relative z-10 mx-auto -mt-20 flex w-full max-w-6xl items-center px-5 pb-12 lg:mt-0 lg:min-h-[min(calc(100svh-4rem),52rem)] lg:py-16">
          <div className="lg:w-[54%]">
            {site.available && (
              <p className="rise inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
                </span>
                <AnimatedShinyText className="mx-0">Available for new projects</AnimatedShinyText>
              </p>
            )}
            <div className="rise mt-8" style={{ '--i': 1 } as React.CSSProperties}>
              <p className="text-lg font-semibold tracking-tight">{site.name}</p>
              <p className="label mt-1">
                Senior <span className="text-sec">Cybersecurity</span> <span className="text-muted">&</span> <span className="text-web">Web</span> Developer
              </p>
              <p className="mt-2 flex gap-1.5 text-sm text-muted">
                Right now: <WordRotate words={focus} className="font-medium text-fg" />
              </p>
            </div>
            <h1 className="rise mt-6 text-[clamp(2.6rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]" style={{ '--i': 2 } as React.CSSProperties}>
              {features.decryptHeadline ? <DecryptText text={site.headline[0]} delay={250} /> : site.headline[0]}
              <br />
              <span className={features.gradientHeadline ? 'headline-gradient' : 'text-muted'}>{site.headline[1]}</span>
            </h1>
            <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted" style={{ '--i': 3 } as React.CSSProperties}>
              {site.intro}
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ '--i': 4 } as React.CSSProperties}>
              <Link href="/work" className="btn-shine group relative overflow-hidden rounded-lg bg-fg px-5 py-3 font-medium text-bg transition-opacity hover:opacity-90">
                See the work{' '}
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                  →
                </span>
              </Link>
              <Link href="/#contact" className="rounded-lg border border-line bg-surface px-5 py-3 font-medium transition-colors hover:border-muted/60">
                Book a security review
              </Link>
              <a
                href={site.github.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-3 font-medium text-muted transition-colors hover:text-fg"
              >
                GitHub ↗
              </a>
            </div>
            <ul className="rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Proof" style={{ '--i': 5 } as React.CSSProperties}>
              {proof.map(([what, backing]) => (
                <li key={what} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
                  <span className="font-medium text-fg">{what}</span> {backing}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* First thing on phones, full width with the text overlapping its faded bottom; on desktop it fills
            the hero's right side, flush to the screen edge, and fades into the page on the left (see .hero-portrait). */}
        <div
          className="rise relative order-first h-[min(58svh,520px)] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[46%]"
          style={{ '--i': 2 } as React.CSSProperties}
        >
          <HeroPortrait initial={theme} />
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section aria-label="At a glance" className="border-b border-line">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-5 py-8 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''} border-line md:border-l md:first:border-l-0`}>
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd data-count className="mt-1 text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        {/* ── Services ───────────────────────────────────── */}
        <section data-reveal aria-labelledby="services" className="py-24">
          <SectionHead id="services" kicker="Services" title="Two disciplines, one engineer." />
          <div className="grid gap-4 lg:grid-cols-2">
            {(['security', 'web'] as const).map((k) => {
              const s = services[k]
              const accent = k === 'security' ? 'text-sec' : 'text-web'
              const bar = k === 'security' ? 'bg-sec' : 'bg-web'
              return (
                <article key={k} data-spotlight className="relative overflow-hidden rounded-2xl border border-line bg-surface p-7 md:p-9">
                  <span className={`absolute inset-x-0 top-0 h-[3px] ${bar}`} aria-hidden="true" />
                  <BorderBeam
                    size={120}
                    duration={10}
                    borderWidth={1.5}
                    reverse={k === 'web'}
                    colorFrom={k === 'security' ? 'var(--sec)' : 'var(--web)'}
                    colorTo="transparent"
                  />
                  <p className={`label ${accent}`}>{s.kicker}</p>
                  <h3 className="mt-3 text-4xl font-semibold tracking-tight">{s.title}.</h3>
                  <p className="mt-3 max-w-md text-muted">{s.blurb}</p>
                  <ul className="mt-8 divide-y divide-line border-t border-line">
                    {s.items.map(([t, d]) => (
                      <li key={t} className="grid gap-1 py-4 sm:grid-cols-[1fr_1.2fr] sm:gap-6">
                        <span className="font-medium">{t}</span>
                        <span className="text-sm text-muted">{d}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── Work ───────────────────────────────────────── */}
        <section data-reveal aria-labelledby="work" className="border-t border-line py-24">
          <SectionHead id="work" kicker="Selected work" title="Case studies">
            <Link href="/work" className="text-sm text-muted hover:text-fg">
              All work →
            </Link>
          </SectionHead>
          <WorkGrid items={work.map(({ slug, metadata }) => ({ slug, metadata }))} />
        </section>

        {/* ── Method ─────────────────────────────────────── */}
        <section data-reveal aria-labelledby="method" className="border-t border-line py-24">
          <SectionHead id="method" kicker="How I work" title="Attack and build in the same loop." />
          <MethodFlow steps={method} beams={features.methodBeams} />
        </section>

        {/* ── Experience + toolbox ───────────────────────── */}
        <section data-reveal aria-labelledby="experience" className="grid gap-16 border-t border-line py-24 lg:grid-cols-2">
          <div>
            <SectionHead id="experience" kicker="Timeline" title="Recent milestones." />
            <ol className="relative">
              <span className="timeline-spine absolute bottom-2 left-0 top-2 w-px" aria-hidden="true" />
              {experience.map((e) => (
                <li key={e.role} className="relative pb-10 pl-7 last:pb-0">
                  <span className="timeline-dot absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg" data-track={e.track} aria-hidden="true" />
                  <p className="font-mono text-xs text-muted">{e.period}</p>
                  <h3 className="mt-1.5 text-lg font-semibold">{e.role}</h3>
                  <p className="text-sm text-muted">{e.org}</p>
                  <p className="mt-2 text-muted">{e.note}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHead id="toolbox" kicker="Toolbox" title="What I reach for." />
            <div className="grid gap-4">
              {toolbox.map((g, i) => (
                <div key={g.group} className="overflow-hidden rounded-2xl border border-line bg-surface py-4">
                  <p className={`label px-5 ${g.track === 'security' ? 'text-sec' : 'text-web'}`}>{g.group}</p>
                  <Marquee
                    pauseOnHover
                    reverse={i % 2 === 1}
                    className="mt-2 px-0 [--duration:30s] [--gap:0.375rem] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
                  >
                    {g.items.map((t) => (
                      <span key={t} className="whitespace-nowrap rounded-md bg-surface-2 px-2 py-1 font-mono text-xs">
                        {t}
                      </span>
                    ))}
                  </Marquee>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Writing ────────────────────────────────────── */}
        <section data-reveal aria-labelledby="writing" className="border-t border-line py-24">
          <SectionHead id="writing" kicker="Writing" title="Notes from both sides.">
            <Link href="/blog" className="text-sm text-muted hover:text-fg">
              All posts →
            </Link>
          </SectionHead>
          <WritingList
            items={posts.map((p) => ({
              slug: p.slug,
              title: p.metadata.title,
              summary: p.metadata.summary,
              date: formatDate(p.metadata.publishedAt),
              dateTime: p.metadata.publishedAt,
              track: p.metadata.track,
            }))}
          />
        </section>

        {/* ── Contact ────────────────────────────────────── */}
        <section data-reveal aria-labelledby="contact" className="relative isolate grid gap-12 overflow-hidden border-t border-line py-24 lg:grid-cols-[1fr_1.3fr]">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <Meteors number={14} />
          </div>
          <div>
            <p className="label">Contact</p>
            <TextAnimate as="h2" id="contact" animation="blurInUp" by="word" once className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Let’s secure what you’re building.
            </TextAnimate>
            <p className="mt-5 max-w-md text-lg text-muted">
              A pentest before launch, a hardened rebuild, or a team that needs both. Tell me what you’re working on.
            </p>
            <dl className="mt-10 space-y-4 text-sm">
              <div>
                <dt className="label">Email</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-3">
                  <a href={`mailto:${site.email}`} className="break-all text-lg hover:text-web">
                    {site.email}
                  </a>
                  <CopyButton value={site.email} label="email address" />
                </dd>
              </div>
              <div>
                <dt className="label">GitHub</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-3">
                  <a href={site.github.href} target="_blank" rel="noopener noreferrer" className="text-lg hover:text-web">
                    github.com/{site.github.handle} ↗
                  </a>
                  <CopyButton value={site.github.href} label="GitHub link" />
                </dd>
              </div>
              <div>
                <dt className="label">Based</dt>
                <dd className="mt-1 text-lg">{site.location}</dd>
              </div>
            </dl>
            <div className="relative mt-10 rounded-2xl border border-line bg-surface p-5">
              <ShineBorder shineColor={['#f0533f', '#5b8def']} />
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
                Usually replies within 2 days
              </p>
              <p className="mt-2 text-sm text-muted">
                Security reviews, web builds, or cybersecurity training for your team.
              </p>
            </div>
          </div>
          <ContactForm />
        </section>
      </div>
    </>
  )
}
