import type { ReactNode } from 'react'
import styles from '../controls/Controls.module.css'

/** Label + control, lined up with the other settings rows. */
export function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.row} title={hint}>
      <span className={styles.label}>{label}</span>
      {children}
      <span />
    </div>
  )
}
