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
  /** Screenshot of the live site in public/, shown in a browser frame on the card. */
  shot?: string
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

/* Front matter is checked when it is read. `next build` pre-renders the sitemap, which reads
   every file, so a missing title or a misspelt track fails the build with the file name
   instead of shipping a broken card. */
const TRACKS: readonly string[] = ['security', 'web', 'both']
const HTTPS_URL = /^https:\/\/\S+$/

function checker(file: string, data: Record<string, string>) {
  const fail = (msg: string): never => {
    throw new Error(`Invalid front matter in ${file}: ${msg}`)
  }
  const text = (key: string) => data[key] || fail(`"${key}" is missing`)
  return {
    fail,
    text,
    track: () => {
      const value = text('track')
      return TRACKS.includes(value) ? (value as Track) : fail(`track "${value}" must be one of: ${TRACKS.join(', ')}`)
    },
    /** Optional link: empty is fine, anything else must be https. */
    url: (key: string) => {
      const value = data[key]
      if (value && !HTTPS_URL.test(value)) fail(`"${key}" must be an https:// URL, got "${value}"`)
      return value || undefined
    },
  }
}

function readDir(dir: string) {
  const root = path.join(process.cwd(), 'content', dir)
  return fs
    .readdirSync(root)
    .filter((f) => path.extname(f) === '.mdx')
    .map((f) => {
      const { data, content } = parseFrontmatter(fs.readFileSync(path.join(root, f), 'utf-8'))
      return { slug: path.basename(f, '.mdx'), content, check: checker(`content/${dir}/${f}`, data), data }
    })
}

export function getWork(): Entry<WorkMeta>[] {
  return readDir('work')
    .map(({ slug, data, content, check }) => {
      const year = check.text('year')
      if (!/^\d{4}$/.test(year)) check.fail(`year "${year}" must be four digits`)
      const order = Number(data.order ?? 99)
      if (!Number.isInteger(order)) check.fail(`order "${data.order}" must be a whole number`)
      const stack = check.text('stack').split(',').map((s) => s.trim()).filter(Boolean)
      const shot = data.shot || undefined
      if (shot && !fs.existsSync(path.join(process.cwd(), 'public', shot)))
        check.fail(`shot "${shot}" is not a file in public/`)
      const repos = (data.repos ?? '')
        .split(';')
        .filter((pair) => pair.trim())
        .map((pair) => {
          const [label, href] = pair.split('|').map((s) => s.trim())
          if (!label || !href || !HTTPS_URL.test(href)) check.fail(`repos entry "${pair.trim()}" must be "Label | https://…"`)
          return { label, href }
        })
      return {
        slug,
        content,
        metadata: {
          title: check.text('title'),
          summary: check.text('summary'),
          year,
          track: check.track(),
          role: check.text('role'),
          client: check.text('client'),
          stack,
          outcome: check.text('outcome'),
          order,
          repo: check.url('repo'),
          live: check.url('live'),
          shot,
          repos,
        },
      }
    })
    .sort((a, b) => a.metadata.order - b.metadata.order)
}

export function getPosts(): Entry<PostMeta>[] {
  return readDir('posts')
    .map(({ slug, content, check }) => {
      const publishedAt = check.text('publishedAt')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt) || Number.isNaN(Date.parse(publishedAt)))
        check.fail(`publishedAt "${publishedAt}" must be a date like 2026-01-31`)
      return {
        slug,
        content,
        metadata: { title: check.text('title'), publishedAt, summary: check.text('summary'), track: check.track() },
      }
    })
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
