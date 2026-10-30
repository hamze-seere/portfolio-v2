'use server'

import { headers } from 'next/headers'
import { validate, type Fields, type FormState } from '@/lib/contact'

/*
  Contact endpoint. Server actions already enforce same-origin. On top: honeypot,
  minimum fill time, per-IP rate limit, and server-side re-validation.
  Delivery: POSTs JSON to CONTACT_WEBHOOK_URL (Resend, Slack, n8n…). Without it,
  development logs to the server console and production refuses honestly.
*/

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>() // in-memory; use KV/Redis across instances

function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

const str = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
const newRef = () => 'REQ-' + crypto.randomUUID().slice(0, 8).toUpperCase()

export async function sendMessage(_prev: FormState, form: FormData): Promise<FormState> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'local'

  const fields: Fields = {
    name: str(form.get('name'), 200),
    email: str(form.get('email'), 320),
    topic: str(form.get('topic'), 80),
    message: str(form.get('message'), 5000),
  }

  // Bots fill the hidden field or submit faster than a person can type: pretend success.
  const openedAt = Number(str(form.get('t'), 20))
  if (str(form.get('website'), 200) || !openedAt || Date.now() - openedAt < 3000) return { status: 'sent', ref: newRef() }

  if (limited(ip)) return { status: 'error', errors: {}, message: 'Too many messages from your network. Please try again in 10 minutes.' }

  const errors = validate(fields)
  if (Object.keys(errors).length) return { status: 'error', errors }

  const ref = newRef()
  const hook = process.env.CONTACT_WEBHOOK_URL
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ref, ...fields, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      return { status: 'error', errors: {}, message: 'The message could not be delivered. Please try again, or email me directly.' }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.info('[contact]', { ref, ...fields })
  } else {
    return { status: 'error', errors: {}, message: 'The contact form is not connected yet. Please email me directly.' }
  }

  return { status: 'sent', ref }
}
