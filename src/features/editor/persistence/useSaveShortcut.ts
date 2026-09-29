import { useEffect } from 'react'

/** Ctrl/⌘+S saves right away instead of opening the browser's "Save page" dialog. */
export function useSaveShortcut(saveNow: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveNow()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [saveNow])
}
