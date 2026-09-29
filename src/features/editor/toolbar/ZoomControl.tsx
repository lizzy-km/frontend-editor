import { Button } from '@/shared/ui'
import { useViewStore } from '../store/view.store'
import styles from './Toolbar.module.css'

const STEP = 0.1

export function ZoomControl() {
  const zoom = useViewStore((state) => state.zoom)
  const scale = useViewStore((state) => state.scale)
  const setZoom = useViewStore((state) => state.setZoom)

  return (
    <div className={styles.group}>
      <Button variant="ghost" size="small" icon="zoomOut" aria-label="Zoom out" onClick={() => setZoom(scale - STEP)} />
      <button
        type="button" className={styles.zoomValue} title="Fit the page to the screen"
        onClick={() => setZoom('fit')}
      >
        {zoom === 'fit' ? 'Fit' : `${Math.round(scale * 100)}%`}
      </button>
      <Button variant="ghost" size="small" icon="zoomIn" aria-label="Zoom in" onClick={() => setZoom(scale + STEP)} />
    </div>
  )
}
