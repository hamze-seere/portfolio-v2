'use server'

import { headers } from 'next/headers'
import { validate, type Fields, type FormState } from '@/lib/contact'
import { site } from '@/lib/site'

/*
  Contact endpoint. Server actions already enforce same-origin. On top: honeypot,
  minimum fill time, per-IP rate limit, and server-side re-validation.
  Delivery: with RESEND_API_KEY, emails the message to CONTACT_TO (default: site.email)
  from CONTACT_FROM (default: Resend's onboarding sender, which only delivers to the
  Resend account's own address). Or POSTs JSON to CONTACT_WEBHOOK_URL (n8n, Zapier,
  Make…). With neither, development logs to the console and production refuses honestly.
*/

async function deliver(ref: string, fields: Fields) {
  const key = process.env.RESEND_API_KEY
  const hook = process.env.CONTACT_WEBHOOK_URL
  let res: Response
  if (key) {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || site.email],
        reply_to: fields.email,
        subject: `${fields.topic || 'New message'} from ${fields.name}`.replace(/[\r\n]+/g, ' ').slice(0, 200),
        text: `${fields.message}\n\n— ${fields.name} <${fields.email}>\nTopic: ${fields.topic}\nRef: ${ref}`,
      }),
      signal: AbortSignal.timeout(8000),
    })
  } else if (hook) {
    res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref, ...fields, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    })
  } else return false
  if (!res.ok) throw new Error(String(res.status))
  return true
}

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
  let delivered: boolean
  try {
    delivered = await deliver(ref, fields)
  } catch {
    return { status: 'error', errors: {}, message: 'The message could not be delivered. Please try again, or email me directly.' }
  }
  if (!delivered) {
    if (process.env.NODE_ENV === 'production') return { status: 'error', errors: {}, message: 'The contact form is not connected yet. Please email me directly.' }
    console.info('[contact]', { ref, ...fields })
  }

  return { status: 'sent', ref }
}
