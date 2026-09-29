import { useEffect, useState } from 'react'
import { BREAKPOINTS } from '@/features/editor/model/breakpoints'
import { useViewStore } from '@/features/editor/store/view.store'
import { DeviceSwitch } from '@/features/editor/toolbar/DeviceSwitch'
import { Button } from '@/shared/ui'
import { pageHtml } from './exportActions'
import styles from './PreviewOverlay.module.css'

/**
 * Shows the page exactly as visitors will see it, with its JavaScript running.
 * The sandbox has NO allow-same-origin: the page can't touch the editor or
 * the user's account, even if the pasted code is hostile.
 */
export function PreviewOverlay() {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const setPreview = useViewStore((state) => state.setPreview)
  const [html] = useState(pageHtml)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setPreview(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPreview])

  return (
    <div className={styles.overlay} role="dialog" aria-label="Preview">
      <header className={styles.bar}>
        <Button variant="primary" size="small" icon="arrowLeft" onClick={() => setPreview(false)}>Back to editing</Button>
        <DeviceSwitch />
        <span className={styles.hint}>Buttons, menus and animations work here</span>
      </header>
      <div className={styles.stage}>
        <iframe
          title="Preview of your page" srcDoc={html} className={styles.frame}
          style={{ width: breakpoint === 'desktop' ? '100%' : BREAKPOINTS[breakpoint].frameWidth }}
          sandbox="allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  )
}
