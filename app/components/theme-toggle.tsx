'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

export type Theme = 'dark' | 'light'

/* Day/night switch. Stores the choice in a cookie the server reads on the next
   request, and flips data-theme immediately so there's no reload; the new theme
   wipes in as a circle from the button (Magic UI theme toggler). Also responds
   to a `theme:toggle` window event (used by the command palette). */
export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const wrapRef = useRef<HTMLSpanElement>(null)

  const save = useCallback((to: Theme) => {
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `theme=${to}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
    setTheme(to)
  }, [])

  useEffect(() => {
    const flip = () => wrapRef.current?.querySelector('button')?.click()
    window.addEventListener('theme:toggle', flip)
    return () => window.removeEventListener('theme:toggle', flip)
  }, [])

  return (
    <span ref={wrapRef} className="contents">
      <AnimatedThemeToggler
        theme={theme}
        onThemeChange={save}
        duration={500}
        aria-label={`Switch to ${next === 'light' ? 'day' : 'night'} mode`}
        title={`Switch to ${next === 'light' ? 'day' : 'night'} mode`}
        className="rounded-md p-2 text-muted transition-colors hover:text-fg"
      >
        {theme === 'dark' ? (
          // Night active → show the sun (switch to day)
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          // Day active → show the moon (switch to night)
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
          </svg>
        )}
      </AnimatedThemeToggler>
    </span>
  )
}
