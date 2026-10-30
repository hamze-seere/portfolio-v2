import type { Track } from '@/lib/content'

const LABEL: Record<Track, string> = { security: 'Security', web: 'Web', both: 'Security + Web' }

/** Colour-coded discipline tag: --sec for security, --web for web, both for both. */
export function TrackTag({ track }: { track: Track }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted">
      {track !== 'web' && <span className="h-1.5 w-1.5 rounded-full bg-sec" />}
      {track !== 'security' && <span className="h-1.5 w-1.5 rounded-full bg-web" />}
      {LABEL[track]}
    </span>
  )
}
