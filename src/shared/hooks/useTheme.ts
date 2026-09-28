import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

type ThemeState = { theme: Theme; setTheme: (theme: Theme) => void }

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readSavedTheme(),
  setTheme: (theme) => {
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* private mode: ignore */ }
    set({ theme })
  },
}))

/** Mirrors the chosen theme onto <html data-theme>, which tokens.css reads. */
export function useApplyTheme() {
  const theme = useThemeStore((state) => state.theme)
  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}
