import { LIST_ATTR } from '../model/dataLists'
import { RECORD_ATTR } from '../model/dataRecords'
import { FLAG_ATTR } from '../model/flagClicks'
import { UPDATE_ATTR } from '../model/updateClicks'
import { ASK_ATTR, CLOSE_ATTR, OPEN_ATTR } from '../model/popups'
import { GO_ATTR } from '../model/pages'
import { conditionOf, hasCondition } from '../model/conditions'
import type { ElementNode } from '../model/types'
import type { InspectorTab } from '../store/view.store'
import styles from './Inspector.module.css'

const TABS: { id: InspectorTab; label: string; hint: string }[] = [
  { id: 'design', label: 'Design', hint: 'How it looks: words, picture, color, size, space, border' },
  { id: 'actions', label: 'Actions', hint: 'What it does: link, click, pop-up, form, who can see it, animation' },
  { id: 'more', label: 'More', hint: 'Show or hide it, attributes and your own CSS' },
]

/** Is something already set under Actions? (A dot on the tab tells people it is not empty.) */
export function hasActions(node: ElementNode): boolean {
  const { attrs } = node
  return Boolean(attrs[FLAG_ATTR] || attrs[UPDATE_ATTR] || attrs[GO_ATTR] || attrs[OPEN_ATTR] || attrs[ASK_ATTR] || CLOSE_ATTR in attrs || attrs['data-fe-animate'] || attrs['data-fe-submit'] || LIST_ATTR in attrs || RECORD_ATTR in attrs)
    || hasCondition(conditionOf(node))
}

type Props = { tab: InspectorTab; onChange: (tab: InspectorTab) => void; actions: boolean; actionsUsed: boolean }

/** Design / Actions / More. Actions is left out for things that can't do anything (the page itself). */
export function InspectorTabs({ tab, onChange, actions, actionsUsed }: Props) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Settings">
      {TABS.filter((item) => item.id !== 'actions' || actions).map((item) => (
        <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} title={item.hint} className={styles.tab} onClick={() => onChange(item.id)}>
          {item.label}
          {item.id === 'actions' && actionsUsed && <span className={styles.dot} aria-hidden="true" />}
        </button>
      ))}
    </div>
  )
}
