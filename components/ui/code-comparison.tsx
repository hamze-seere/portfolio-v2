// Magic UI — Code Comparison (magicui.design/r/code-comparison.json).
// Adapted for this site: highlighted on the server with sugar-high (already
// used for MDX code) instead of Shiki, whose WebAssembly the CSP blocks, so it
// needs no client JS or next-themes. Shiki's line notations are kept, handled
// here: end a line with // [!code ++], // [!code --], // [!code highlight] or
// // [!code focus]. Colours use the site tokens; lucide's FileIcon is inline.
import { Fragment } from 'react'
import { highlight } from 'sugar-high'

import { cn } from '@/lib/utils'

interface CodeComparisonProps {
  beforeCode: string
  afterCode: string
  filename: string
  /** Optional second filename for the "after" side. */
  afterFilename?: string
  highlightColor?: string
}

const NOTATION = /\s*\/\/\s*\[!code (\+\+|--|highlight|focus)\]\s*$/
const LINE_CLASS = { '++': 'add', '--': 'remove', highlight: 'highlighted', focus: 'focused' } as const

function parse(code: string) {
  const lines = code.replace(/^\n+|\s+$/g, '').split('\n')
  const out = lines.map((line) => {
    const m = line.match(NOTATION)
    const text = m ? line.replace(NOTATION, '') : line
    return { html: highlight(text) || ' ', cls: m ? LINE_CLASS[m[1] as keyof typeof LINE_CLASS] : '' }
  })
  return { lines: out, hasFocus: out.some((l) => l.cls === 'focused') }
}

function FileIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}

export function CodeComparison({ beforeCode, afterCode, filename, afterFilename, highlightColor = 'color-mix(in srgb, var(--web) 18%, transparent)' }: CodeComparisonProps) {
  const before = parse(beforeCode)
  const after = parse(afterCode)

  const renderCode = (lines: ReturnType<typeof parse>['lines']) => (
    <div
      style={{ '--highlight-color': highlightColor } as React.CSSProperties}
      className={cn(
        'h-full w-full overflow-auto bg-surface font-mono text-xs',
        '[&>pre]:h-full [&>pre]:w-max! [&>pre]:min-w-full [&>pre]:py-2',
        '[&>pre>code]:inline-block! [&>pre>code]:w-full!',
        '[&>pre>code>span]:inline-block! [&>pre>code>span]:w-full [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5',
        '[&>pre>code>.highlighted]:inline-block [&>pre>code>.highlighted]:w-full [&>pre>code>.highlighted]:bg-(--highlight-color)!',
        'group-hover/left:[&>pre>code>:not(.focused)]:opacity-100! group-hover/left:[&>pre>code>:not(.focused)]:blur-none!',
        'group-hover/right:[&>pre>code>:not(.focused)]:opacity-100! group-hover/right:[&>pre>code>:not(.focused)]:blur-none!',
        '[&>pre>code>.add]:bg-[rgba(16,185,129,.16)] [&>pre>code>.remove]:bg-[rgba(244,63,94,.16)]',
        'group-hover/left:[&>pre>code>:not(.focused)]:transition-all group-hover/left:[&>pre>code>:not(.focused)]:duration-300',
        'group-hover/right:[&>pre>code>:not(.focused)]:transition-all group-hover/right:[&>pre>code>:not(.focused)]:duration-300'
      )}
    >
      <pre className="m-0! rounded-none! border-0! bg-transparent! p-0!">
        <code>
          {lines.map((l, i) => (
            // Newline between lines, as in Shiki's output; sugar-high escapes
            // source text before wrapping tokens in spans.
            <Fragment key={i}>
              {i > 0 && '\n'}
              <span className={l.cls || undefined} dangerouslySetInnerHTML={{ __html: l.html }} />
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  )

  return (
    <div className="code-comparison not-prose mx-auto w-full max-w-5xl">
      <div className="group relative w-full overflow-hidden rounded-md border border-line">
        <div className="relative grid md:grid-cols-2">
          <div
            className={cn(
              'leftside group/left border-line md:border-r',
              before.hasFocus && '[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!',
              '[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300'
            )}
          >
            <div className="flex items-center border-b border-line bg-surface-2 p-2 text-sm text-fg">
              <FileIcon />
              {filename}
              <span className="ml-auto hidden text-sec md:block">before</span>
            </div>
            {renderCode(before.lines)}
          </div>
          <div
            className={cn(
              'rightside group/right border-t border-line md:border-t-0',
              after.hasFocus && '[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!',
              '[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300'
            )}
          >
            <div className="flex items-center border-b border-line bg-surface-2 p-2 text-sm text-fg">
              <FileIcon />
              {afterFilename ?? filename}
              <span className="ml-auto hidden text-web md:block">after</span>
            </div>
            {renderCode(after.lines)}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-line bg-surface-2 text-xs text-fg md:flex">
          VS
        </div>
      </div>
    </div>
  )
}
