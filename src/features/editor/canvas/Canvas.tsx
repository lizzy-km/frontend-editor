import { useEffect, useRef, useState } from 'react'
import { useElementSize } from '@/shared/hooks/useElementSize'
import { EditorFrame } from '../frame/EditorFrame'
import { BREAKPOINTS } from '../model/breakpoints'
import { useViewStore } from '../store/view.store'
import styles from './Canvas.module.css'
import { Overlay } from './Overlay'

const PADDING = 24

/** Works out zoom and where the page sits inside the canvas area. */
function useLayout(width: number, height: number, panX: number) {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const zoom = useViewStore((state) => state.zoom)
  const frameWidth = BREAKPOINTS[breakpoint].frameWidth
  const fit = Math.min(1, Math.max(0.1, (width - PADDING * 2) / frameWidth))
  const scale = zoom === 'fit' ? fit : zoom

  const scaledWidth = frameWidth * scale
  const overflow = Math.max(0, scaledWidth + PADDING * 2 - width)
  const left = overflow > 0 ? PADDING - Math.min(panX, overflow) : (width - scaledWidth) / 2
  const visibleHeight = Math.max(100, height - PADDING * 2)

  return { frameWidth, scale, left, top: PADDING, scaledWidth, visibleHeight, overflow }
}

/** The editing area: the live page with the interactive overlay on top. */
export function Canvas() {
  const ref = useRef<HTMLDivElement>(null)
  const size = useElementSize(ref)
  const [panX, setPanX] = useState(0)
  const layout = useLayout(size.width, size.height, panX)
  const setScale = useViewStore((state) => state.setScale)

  useEffect(() => setScale(layout.scale), [layout.scale, setScale])

  const pan = (dx: number) => setPanX((old) => Math.min(layout.overflow, Math.max(0, old + dx)))
  const placement = { left: layout.left, top: layout.top, scale: layout.scale }
  const clip = { x: layout.left, y: layout.top, width: layout.scaledWidth, height: layout.visibleHeight }

  return (
    <div ref={ref} className={styles.canvas}>
      <div className={styles.page} style={{ left: layout.left, top: layout.top, width: layout.scaledWidth, height: layout.visibleHeight }}>
        <EditorFrame width={layout.frameWidth} height={layout.visibleHeight / layout.scale} scale={layout.scale} />
      </div>
      {size.width > 0 && <Overlay width={size.width} height={size.height} placement={placement} clip={clip} onPan={pan} />}
    </div>
  )
}
