import type { ReactNode } from 'react'
import { DeviceSwitch } from './DeviceSwitch'
import { HistoryButtons } from './HistoryButtons'
import styles from './Toolbar.module.css'
import { ZoomControl } from './ZoomControl'

type Props = {
  /** Left side: back button, project name... */
  start?: ReactNode
  /** Right side: save status, preview, download... */
  end?: ReactNode
}

/** Top bar of the editor. Pages plug their own buttons into `start` / `end`. */
export function EditorToolbar({ start, end }: Props) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.side}>{start}</div>
      <div className={styles.center}>
        <HistoryButtons />
        <DeviceSwitch />
        <ZoomControl />
      </div>
      <div className={`${styles.side} ${styles.end}`}>{end}</div>
    </header>
  )
}
