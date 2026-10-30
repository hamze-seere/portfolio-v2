/* Contact form validation — shared by the browser and the server action. */

export const TOPICS = ['Security assessment', 'Web build', 'Both', 'Something else'] as const

export type Fields = { name: string; email: string; topic: string; message: string }
export type Errors = Partial<Record<keyof Fields, string>>
export type FormState = { status: 'idle' } | { status: 'error'; errors: Errors; message?: string } | { status: 'sent'; ref: string }

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]{1,253}\.[a-z]{2,24}$/i

export function validate(f: Fields): Errors {
  const e: Errors = {}
  const name = f.name.trim()
  if (name.length < 2) e.name = 'Please enter your name.'
  else if (name.length > 80) e.name = 'Name must be 80 characters or fewer.'
  if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address, like name@company.com.'
  if (!TOPICS.includes(f.topic as (typeof TOPICS)[number])) e.topic = 'Choose what you need help with.'
  const msg = f.message.trim()
  if (msg.length < 20) e.message = `Tell me a little more — ${20 - msg.length} more characters.`
  else if (msg.length > 4000) e.message = 'Message must be 4000 characters or fewer.'
  return e
}
