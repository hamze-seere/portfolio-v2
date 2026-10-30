'use client'

import { useEffect, useState } from 'react'
import { features } from '@/lib/features'
import { ShineBorder } from '@/components/ui/shine-border'

/*
  Hero terminal. Not a fake: it re-requests this page and prints the security
  headers the browser actually received, one line at a time.
*/
const CHECKS = [
  ['content-security-policy', 'Content-Security-Policy'],
  ['strict-transport-security', 'Strict-Transport-Security'],
  ['x-content-type-options', 'X-Content-Type-Options'],
  ['x-frame-options', 'X-Frame-Options'],
  ['referrer-policy', 'Referrer-Policy'],
  ['permissions-policy', 'Permissions-Policy'],
  ['cross-origin-opener-policy', 'Cross-Origin-Opener-Policy'],
] as const

type Line = { ok: boolean; name: string; detail: string }

export function HeaderAudit() {
  const [host, setHost] = useState('')
  const [proto, setProto] = useState('https')
  const [lines, setLines] = useState<Line[] | null>(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setHost(location.host)
    setProto(location.protocol.replace(':', ''))
    fetch(location.pathname, { method: 'HEAD', cache: 'no-store', credentials: 'omit' })
      .then((r) =>
        CHECKS.map(([key, name]) => {
          const v = r.headers.get(key) ?? ''
          let detail = v ? 'present' : 'missing'
          if (key === 'content-security-policy' && v) detail = v.includes("'strict-dynamic'") ? 'nonce + strict-dynamic' : 'present'
          if (key === 'strict-transport-security' && v) detail = v.match(/max-age=\d+/)?.[0] ?? 'present'
          if (key === 'x-frame-options' && v) detail = v
          return { ok: !!v, name, detail }
        }),
      )
      .catch(() => [{ ok: false, name: 'request', detail: 'failed' }])
      .then(setLines)
  }, [])

  // Type the command first (optional), then reveal the header lines one by one.
  const command = host ? `curl -sI ${proto}://${host}` : ''
  const [typed, setTyped] = useState(features.typingTerminal ? 0 : Infinity)
  const typing = typed < command.length

  useEffect(() => {
    if (!command || !typing) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setTyped(Infinity)
    const t = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 450 : 38)
    return () => clearTimeout(t)
  }, [command, typed, typing])

  useEffect(() => {
    if (!lines || !command || typing) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(lines.length)
    if (shown >= lines.length) return
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 260 : 140)
    return () => clearTimeout(t)
  }, [lines, shown, command, typing])

  const passed = lines?.filter((l) => l.ok).length ?? 0
  const done = lines && shown >= lines.length

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/20" aria-label="Live security header check of this site">
      <ShineBorder borderWidth={1.5} shineColor={['var(--sec)', 'var(--web)']} />
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-sec/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffb454]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-ok/80" />
        <span className="ml-3 font-mono text-xs text-muted">audit — this site, live</span>
      </div>
      <div className="min-h-[300px] p-5 font-mono text-[13px] leading-7">
        <p>
          <span className="text-ok">$</span> {command ? command.slice(0, typed) : '…'}
          {typing && <span className="caret" />}
        </p>
        <ul aria-live="polite">
          {lines?.slice(0, shown).map((l) => (
            <li key={l.name} className="flex gap-3">
              <span className={l.ok ? 'text-ok' : 'text-sec'}>{l.ok ? '✓' : '✗'}</span>
              <span className="truncate">{l.name}</span>
              <span className="ml-auto hidden shrink-0 text-muted sm:inline">{l.detail}</span>
            </li>
          ))}
        </ul>
        {done ? (
          <p className="mt-2">
            <span className="text-ok">$</span>{' '}
            <span className={passed === lines.length ? 'text-ok' : 'text-sec'}>
              {passed}/{lines.length} hardening headers present
            </span>
            <span className="caret" />
          </p>
        ) : typing ? null : (
          <p className="text-muted">
            <span className="caret" />
          </p>
        )}
      </div>
      <figcaption className="border-t border-line px-5 py-3 text-xs text-muted">
        The site you are reading is the first portfolio piece.{' '}
        {host && (
          <a className="text-web hover:underline" href={`https://securityheaders.com/?q=${encodeURIComponent(host)}&followRedirects=on`} target="_blank" rel="noopener noreferrer">
            Verify independently ↗
          </a>
        )}
      </figcaption>
    </figure>
  )
}
