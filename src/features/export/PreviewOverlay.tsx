import { useEffect, useState } from 'react'
import type { Params } from '@/features/editor/model/routes'
import { BREAKPOINTS } from '@/features/editor/model/breakpoints'
import { getDoc } from '@/features/editor/store/doc.store'
import { useViewStore } from '@/features/editor/store/view.store'
import { DeviceSwitch } from '@/features/editor/toolbar/DeviceSwitch'
import { Button } from '@/shared/ui'
import styles from './PreviewOverlay.module.css'
import { SafePageFrame } from './SafePageFrame'

/**
 * Shows the page exactly as visitors will see it, with its JavaScript running
 * inside SafePageFrame (no same-origin: the page can't touch the editor).
 */
export function PreviewOverlay() {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const setPreview = useViewStore((state) => state.setPreview)
  const [doc] = useState(getDoc) // snapshot taken when Preview opens
  const pageId = useViewStore((state) => state.pageId)
  const setPageId = useViewStore((state) => state.setPageId)
  const viewer = useViewStore((state) => state.viewer)
  const [params, setParams] = useState<Params>({})

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
        <SafePageFrame
          doc={doc} title="Preview of your page" className={styles.frame} pageId={pageId} onOpenPage={(id, next) => { setPageId(id); setParams(next) }} params={params} viewer={viewer}
          width={breakpoint === 'desktop' ? '100%' : BREAKPOINTS[breakpoint].frameWidth}
        />
      </div>
    </div>
  )
}
