import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'
const STORAGE_KEY = 'dexlab:theme'

function initialTheme(): Theme {
  // Matches the pre-paint script in index.html, so first render never flashes
  if (typeof document !== 'undefined' && !document.documentElement.classList.contains('dark')) {
    return 'light'
  }
  return 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* private mode — theme just won't persist */
    }
  }, [theme])

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggle }
}
