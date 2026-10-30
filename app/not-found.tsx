import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-32">
      <p className="font-mono text-sm text-sec">HTTP 404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Nothing to see here.</h1>
      <p className="mt-4 text-lg text-muted">This page doesn’t exist — and no, it isn’t hidden. I checked.</p>
      <Link href="/" className="mt-8 inline-block rounded-lg bg-fg px-5 py-3 font-medium text-bg hover:opacity-85">
        Back home
      </Link>
    </div>
  )
}
