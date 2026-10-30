'use client'

import { useState } from 'react'

/** Small "Copy" button that copies `value` and confirms for 1.5s. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          /* clipboard blocked: the value is still visible to copy by hand */
        }
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-muted/60 hover:text-fg"
    >
      <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
    </button>
  )
}
