import { useMemo } from 'react'
import { track } from '@/features/analytics/track'
import type { Where } from '@/features/analytics/events'
import type { PageDoc } from '@/features/editor/model/types'
import { Button, Icon } from '@/shared/ui'
import { SHOWCASES } from './catalog'
import styles from './ShowcasePicker.module.css'

/**
 * "Start from a finished example": complete sites (a shop, a cafe, a studio, a members area) that use the editor's real features.
 * Opening one puts it in the editor like any pasted page: everything can be changed, then downloaded.
 */
export function ShowcasePicker({ onOpen, where }: { onOpen: (doc: PageDoc) => void; where: Where }) {
  const items = useMemo(() => SHOWCASES, [])
  return (
    <details className={styles.picker}>
      <summary className={styles.summary}><Icon name="layers" size={16} /> No idea yet? Start from a finished example</summary>
      <div className={styles.body}>
        <p className={styles.lead}>Each one is a whole website with several pages, working data, search, pop-ups and forms. Open one, change anything, download it.</p>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.card} data-showcase={item.id}>
              <h3>{item.title}</h3>
              <p>{item.tagline}</p>
              <ul className={styles.tags} aria-label="What it shows">{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <Button size="small" variant="primary" icon="plus" onClick={() => { track('open_showcase', { id: item.id, where }); onOpen(item.build()) }}>Open this example</Button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
