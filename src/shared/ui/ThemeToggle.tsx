import { useThemeStore } from '@/shared/hooks/useTheme'
import { Button } from './Button'

/** Flips between light and dark. Starts from the OS setting. */
export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const isDark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      variant="ghost" size="small" icon={isDark ? 'sun' : 'moon'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    />
  )
}
