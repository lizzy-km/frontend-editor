import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from '@/shared/ui'
import styles from './Inspector.module.css'

type Props = {
  title: string
  icon: IconName
  children: ReactNode
  /** Extra controls hidden behind "More options". */
  more?: ReactNode
  defaultOpen?: boolean
}

/** A collapsible group in the settings panel. */
export function Section({ title, icon, children, more, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [showMore, setShowMore] = useState(false)

  return (
    <section className={styles.section}>
      <button type="button" className={styles.sectionHeader} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name={icon} size={16} />
        <span>{title}</span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} className={styles.chevron} />
      </button>
      {open && (
        <div className={styles.sectionBody}>
          {children}
          {more && showMore && more}
          {more && (
            <button type="button" className={styles.moreButton} onClick={() => setShowMore(!showMore)}>
              {showMore ? 'Fewer options' : 'More options'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
