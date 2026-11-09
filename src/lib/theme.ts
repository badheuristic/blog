export type Theme = 'light' | 'dark'

// Must match the inline script in Base.astro.
const STORAGE_KEY = 'theme'

function readSaved(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const systemQuery = () => matchMedia('(prefers-color-scheme: dark)')

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** Applies a theme the visitor picked and remembers it. */
export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (private mode etc.); the choice lasts for this visit only.
  }
}

/** Follows the OS setting until the visitor picks a theme themselves. */
export function followSystemTheme(onChange: () => void) {
  systemQuery().addEventListener('change', (e) => {
    if (readSaved()) return
    document.documentElement.dataset.theme = e.matches ? 'dark' : 'light'
    onChange()
  })
}
