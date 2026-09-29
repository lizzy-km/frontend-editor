import { Icon } from '@/shared/ui'
import { describeNode, labelForNode } from '../labels/elementLabels'
import { BREAKPOINTS } from '../model/breakpoints'
import type { ElementNode, NodeMap } from '../model/types'
import { useViewStore } from '../store/view.store'
import styles from './Inspector.module.css'

const SCOPE_TEXT = {
  desktop: 'Changes show on every screen size (unless you change them for tablet or phone).',
  tablet: 'Changes apply to tablets and phones only.',
  mobile: 'Changes apply to phones only.',
}

/** Name of the selected element + which screen sizes an edit affects. */
export function InspectorHeader({ node, nodes }: { node: ElementNode; nodes: NodeMap }) {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const label = labelForNode(node)
  const description = describeNode(nodes, node, 40)

  return (
    <>
      <div className={styles.header}>
        <span className={styles.headerIcon}><Icon name={label.icon} /></span>
        <div className={styles.headerText}>
          <p className={styles.headerTitle}>{label.name}</p>
          {description !== label.name && <p className={styles.headerSub}>{description.slice(label.name.length).trim()}</p>}
        </div>
      </div>
      <p className={styles.notice}>
        <Icon name={BREAKPOINTS[breakpoint].icon} size={16} />
        <span><strong>{BREAKPOINTS[breakpoint].label} view.</strong> {SCOPE_TEXT[breakpoint]}</span>
      </p>
    </>
  )
}
