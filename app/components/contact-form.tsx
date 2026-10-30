'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { sendMessage } from '@/app/actions'
import { TOPICS, validate, type Fields, type FormState } from '@/lib/contact'
import { ShimmerButton } from '@/components/ui/shimmer-button'

const EMPTY: Fields = { name: '', email: '', topic: '', message: '' }
const input =
  'mt-2 w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-web aria-[invalid=true]:border-sec'

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, { status: 'idle' })
  const [fields, setFields] = useState(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [openedAt, setOpenedAt] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => setOpenedAt(String(Date.now())), [])

  const local = validate(fields)
  const server = state.status === 'error' ? state.errors : {}
  const err = (k: keyof Fields) => (touched[k] ? local[k] : undefined) ?? server[k]
  const bind = (k: keyof Fields) => ({
    id: k,
    name: k,
    value: fields[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFields((f) => ({ ...f, [k]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    'aria-invalid': !!err(k),
    'aria-describedby': `${k}-error`,
  })
  const FieldError = ({ k }: { k: keyof Fields }) => (
    <p id={`${k}-error`} className="mt-1.5 min-h-5 text-sm text-sec">
      {err(k) ?? ''}
    </p>
  )

  if (state.status === 'sent') {
    return (
      <div role="status" className="rounded-2xl border border-line bg-surface p-8">
        <p className="font-mono text-sm text-ok">✓ Message sent · {state.ref}</p>
        <p className="mt-3 text-lg">Thanks — I reply within two working days.</p>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onSubmit={(e) => {
        setTouched({ name: true, email: true, topic: true, message: true })
        const first = Object.keys(local)[0]
        if (first) {
          e.preventDefault()
          formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus()
        }
      }}
      className="rounded-2xl border border-line bg-surface p-6 md:p-8"
    >
      <input type="hidden" name="t" value={openedAt} />
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input {...bind('name')} autoComplete="name" maxLength={80} className={input} />
          <FieldError k="name" />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input {...bind('email')} type="email" autoComplete="email" inputMode="email" maxLength={320} className={input} />
          <FieldError k="email" />
        </div>
      </div>
      <label htmlFor="topic" className="text-sm font-medium">What do you need?</label>
      <select {...bind('topic')} className={input}>
        <option value="">Choose one…</option>
        {TOPICS.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <FieldError k="topic" />
      <label htmlFor="message" className="text-sm font-medium">Message</label>
      <textarea {...bind('message')} rows={5} maxLength={4000} placeholder="What are you building or worried about? Timeline, scope, links." className={`${input} resize-y`} />
      <FieldError k="message" />

      {state.status === 'error' && state.message && (
        <p role="alert" className="mb-4 rounded-lg border border-sec/40 bg-sec/10 px-3.5 py-2.5 text-sm text-sec">
          {state.message}
        </p>
      )}
      <ShimmerButton
        type="submit"
        disabled={pending}
        borderRadius="0.5rem"
        background="linear-gradient(90deg, var(--sec), var(--web))"
        className="w-full px-5 font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? 'Sending…' : 'Send message'}
      </ShimmerButton>
    </form>
  )
}
