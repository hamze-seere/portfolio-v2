'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/*
  Ctrl/⌘ + K command palette. Built on the native <dialog> element, so focus
  trapping, Esc to close and the backdrop come from the browser.
*/
export type PaletteItem = { id: string; label: string; group: 'Pages' | 'Projects' | 'Writing' | 'Actions'; hint?: string; href?: string; external?: boolean }

const OPEN_EVENT = 'palette:open'

function score(query: string, text: string) {
  const q = query.toLowerCase().trim()
  const t = text.toLowerCase()
  if (!q) return 1
  if (t.includes(q)) return 100 - t.indexOf(q)
  // Loose subsequence match ("sscan" → "SecureScan").
  let i = 0
  for (const ch of t) if (ch === q[i]) i++
  return i === q.length ? 10 : -1
}

/** Small trigger for the nav bar. */
export function PaletteButton() {
  const [mac, setMac] = useState(false)
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), [])
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      aria-label="Search the site"
      className="flex items-center gap-2 rounded-md p-2 text-muted transition-colors hover:text-fg md:border md:border-line md:px-2.5 md:py-1.5"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <kbd className="hidden font-mono text-[11px] md:inline">{mac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
  )
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [notice, setNotice] = useState('')

  const results = useMemo(
    () =>
      items
        .map((it) => ({ it, s: Math.max(score(query, it.label), score(query, it.hint ?? '') - 20) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 9)
        .map((r) => r.it),
    [items, query],
  )

  const open = () => {
    setQuery('')
    setIndex(0)
    setNotice('')
    dialog.current?.showModal()
    requestAnimationFrame(() => input.current?.focus())
  }
  const close = () => dialog.current?.close()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (dialog.current?.open) close()
        else open()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, open)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_EVENT, open)
    }
  }, [])

  const run = async (it: PaletteItem | undefined) => {
    if (!it) return
    if (it.id === 'action:copy-email' && it.hint) {
      await navigator.clipboard.writeText(it.hint).catch(() => {})
      setNotice(`Copied ${it.hint}`)
      setTimeout(close, 700)
      return
    }
    close()
    if (it.external && it.href) window.open(it.href, '_blank', 'noopener,noreferrer')
    else if (it.href) router.push(it.href)
  }

  let lastGroup = ''
  return (
    <dialog
      ref={dialog}
      aria-label="Search the site"
      onClick={(e) => e.target === dialog.current && close()}
      className="palette m-auto mt-[12vh] w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIndex(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') (e.preventDefault(), setIndex((i) => Math.min(results.length - 1, i + 1)))
            if (e.key === 'ArrowUp') (e.preventDefault(), setIndex((i) => Math.max(0, i - 1)))
            if (e.key === 'Enter') (e.preventDefault(), run(results[index]))
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[index] ? `palette-${results[index].id}` : undefined}
          aria-autocomplete="list"
          placeholder="Search projects, posts, pages…"
          spellCheck={false}
          autoComplete="off"
          className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
        />
        <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">Esc</kbd>
      </div>

      <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No results for “{query}”</li>}
        {results.map((it, i) => {
          const header = it.group !== lastGroup ? it.group : null
          lastGroup = it.group
          return (
            <li key={it.id} role="presentation">
              {header && <p className="label px-3 pb-1 pt-3 text-[11px]">{header}</p>}
              <div
                id={`palette-${it.id}`}
                role="option"
                aria-selected={i === index}
                onPointerMove={() => setIndex(i)}
                onClick={() => run(it)}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm ${i === index ? 'bg-surface-2 text-fg' : 'text-muted'}`}
              >
                <span className="truncate">{it.label}</span>
                {it.hint && <span className="shrink-0 truncate font-mono text-xs text-muted">{it.external ? `${it.hint} ↗` : it.hint}</span>}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-muted" aria-live="polite">
        <span>{notice || '↑↓ to move · Enter to open'}</span>
        <span className="font-mono">{results.length} results</span>
      </div>
    </dialog>
  )
}
