/* Day / night theme, shared by the server (layout.tsx) and the toggle button.
   The choice lives in a cookie, so the server renders the right theme into the first
   paint: no inline script, no flash of the wrong colours. */

export const THEME_COOKIE = 'theme'

/** Browser UI colour (<meta name="theme-color">) for each theme. */
export const THEME_COLORS = { dark: '#07061a', light: '#f6f5fc' } as const
