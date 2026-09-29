import type { ReactNode } from 'react'
import { Canvas } from '../canvas/Canvas'
import { useEditorShortcuts } from '../shortcuts/useEditorShortcuts'
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
  return (
    <div className={styles.shell}>
      {toolbar}
      <div className={styles.body}>
        {left && <aside className={styles.left}>{left}</aside>}
        <main className={styles.main}>
          <Canvas />
          {overlays}
        </main>
        {right && <aside className={styles.right}>{right}</aside>}
      </div>
    </div>
  )
}
