import type { ReactNode } from 'react'
import styles from '../controls/Controls.module.css'

/** One labelled line of a widget's settings. */
export function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.row} title={hint}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  )
}

/** A few words of help under the controls. */
export function Help({ children }: { children: ReactNode }) {
  return <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.45 }}>{children}</p>
}
