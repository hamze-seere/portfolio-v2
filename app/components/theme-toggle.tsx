'use client'

import { useEffect, useState } from 'react'
import { THEME_COLORS, THEME_COOKIE } from '@/lib/theme'

/*
  Day / night switch. Night (the indigo palette) is the default; day sets
  data-theme="light" on <html>, which swaps the colour tokens in globals.css.
  The choice is saved in a cookie, and layout.tsx renders it on the server, so the
  first paint already has the right theme without an inline script.
*/

function apply(light: boolean) {
  const root = document.documentElement
  if (light) root.dataset.theme = 'light'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? THEME_COLORS.light : THEME_COLORS.dark)
  document.cookie = `${THEME_COOKIE}=${light ? 'light' : 'dark'}; path=/; max-age=31536000; samesite=lax; secure`
}

export function ThemeToggle() {
  const [light, setLight] = useState(false)
  useEffect(() => setLight(document.documentElement.dataset.theme === 'light'), [])

  const toggle = () => {
    // Read the page, not state: a tap can land before the mount effect has synced it.
    const next = document.documentElement.dataset.theme !== 'light'
    setLight(next)
    apply(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'Switch to night colours' : 'Switch to day colours'}
      aria-pressed={light}
      className="theme-toggle rounded-full p-2 text-muted transition-colors hover:text-fg"
    >
      {/* Sun while it's night (tap for day); moon while it's day (tap for night). */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {light ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        )}
      </svg>
    </button>
  )
}
