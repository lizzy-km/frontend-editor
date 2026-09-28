import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import styles from './EmptyState.module.css'

type Props = { icon: IconName; title: string; text?: string; action?: ReactNode }

export function EmptyState({ icon, title, text, action }: Props) {
  return (
    <div className={styles.empty}>
      <span className={styles.badge}><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
