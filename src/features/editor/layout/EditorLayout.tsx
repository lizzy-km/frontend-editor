import type { ReactNode } from 'react'
import { Canvas } from '../canvas/Canvas'
import { useEditorShortcuts } from '../shortcuts/useEditorShortcuts'
import { useViewStore } from '../store/view.store'
import styles from './EditorLayout.module.css'

type Props = {
  toolbar: ReactNode
  /** Left column (layers / add / code). */
  left?: ReactNode
  /** Right column (settings of the selected element). */
  right?: ReactNode
  /** Floating things drawn over the canvas (text editor, quick actions). */
  overlays?: ReactNode
}

/** The editor screen: toolbar on top, panels on the sides, page in the middle. */
export function EditorLayout({ toolbar, left, right, overlays }: Props) {
  useEditorShortcuts()
  // Code needs room: the left column widens while the Code tab is open.
  const wideLeft = useViewStore((state) => state.sidePanel === 'code')
  return (
    <div className={styles.shell}>
      {toolbar}
      <div className={styles.body}>
        {left && <aside className={`${styles.left} ${wideLeft ? styles.wide : ''}`}>{left}</aside>}
        <main className={styles.main}>
          <Canvas />
          {overlays}
        </main>
        {right && <aside className={styles.right}>{right}</aside>}
      </div>
    </div>
  )
}
