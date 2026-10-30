import fs from 'fs'
import path from 'path'

/* MDX content loader — adapted from the Vercel portfolio starter's blog utils,
   generalised so case studies and posts share one frontmatter parser. */

export type Track = 'security' | 'web' | 'both'

export type WorkMeta = {
  title: string
  summary: string
  year: string
  track: Track
  role: string
  client: string
  stack: string[]
  outcome: string
  order: number
  repo?: string
  live?: string
  /** Extra repositories, frontmatter `repos: Label | url ; Label | url` */
  repos: { label: string; href: string }[]
}

export type PostMeta = {
  title: string
  publishedAt: string
  summary: string
  track: Track
}

type Entry<M> = { slug: string; metadata: M; content: string }

function parseFrontmatter(fileContent: string) {
  const match = /^---\s*([\s\S]*?)\s*---/.exec(fileContent)
  const data: Record<string, string> = {}
  if (match) {
    for (const line of match[1].trim().split('\n')) {
      const [key, ...rest] = line.split(': ')
      data[key.trim()] = rest.join(': ').trim().replace(/^['"](.*)['"]$/, '$1')
    }
  }
  return { data, content: fileContent.replace(/^---\s*[\s\S]*?\s*---/, '').trim() }
}

function readDir(dir: string) {
  const root = path.join(process.cwd(), 'content', dir)
  return fs
    .readdirSync(root)
    .filter((f) => path.extname(f) === '.mdx')
    .map((f) => ({ slug: path.basename(f, '.mdx'), ...parseFrontmatter(fs.readFileSync(path.join(root, f), 'utf-8')) }))
}

export function getWork(): Entry<WorkMeta>[] {
  return readDir('work')
    .map(({ slug, data, content }) => ({
      slug,
      content,
      metadata: {
        title: data.title,
        summary: data.summary,
        year: data.year,
        track: (data.track as Track) ?? 'both',
        role: data.role,
        client: data.client,
        stack: (data.stack ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        outcome: data.outcome,
        order: Number(data.order ?? 99),
        repo: data.repo || undefined,
        live: data.live || undefined,
        repos: (data.repos ?? '')
          .split(';')
          .map((pair) => pair.split('|').map((s) => s.trim()))
          .filter(([label, href]) => label && href?.startsWith('https://'))
          .map(([label, href]) => ({ label, href })),
      },
    }))
    .sort((a, b) => a.metadata.order - b.metadata.order)
}

export function getPosts(): Entry<PostMeta>[] {
  return readDir('posts')
    .map(({ slug, data, content }) => ({
      slug,
      content,
      metadata: {
        title: data.title,
        publishedAt: data.publishedAt,
        summary: data.summary,
        track: (data.track as Track) ?? 'both',
      },
    }))
    .sort((a, b) => (a.metadata.publishedAt < b.metadata.publishedAt ? 1 : -1))
}

export function formatDate(date: string) {
  return new Date(date.includes('T') ? date : `${date}T00:00:00`).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function readingTime(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 220))
}
