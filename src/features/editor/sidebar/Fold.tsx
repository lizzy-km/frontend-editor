import type { ReactNode } from 'react'
import { Icon } from '@/shared/ui'
import { useAddFolds } from './addFolds.store'
import styles from './Sidebar.module.css'

type Props = { id: string; title: string; count: number; defaultOpen?: boolean; children: ReactNode }

/** One category of the Add panel that can be folded away, so a long list stays easy to scan. */
export function Fold({ id, title, count, defaultOpen = false, children }: Props) {
  const open = useAddFolds((state) => state.open[id] ?? defaultOpen)
  const toggle = useAddFolds((state) => state.toggle)
  return (
    <section className={styles.fold}>
      <button type="button" className={styles.foldHead} aria-expanded={open} onClick={() => toggle(id, open)}>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} />
        <span>{title}</span>
        <span className={styles.foldCount}>{count}</span>
      </button>
      {open && <div className={styles.blocks}>{children}</div>}
    </section>
  )
}
