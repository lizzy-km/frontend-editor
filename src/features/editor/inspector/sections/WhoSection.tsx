import { conditionOf, describeCondition, hasCondition } from '../../model/conditions'
import type { ElementNode } from '../../model/types'
import { Section } from '../Section'
import styles from './Who.module.css'
import { WhoControl } from './WhoControl'

/** "Who can see this" for any element: menu items, buttons, whole sections… */
export function WhoSection({ node }: { node: ElementNode }) {
  const condition = conditionOf(node)
  return (
    <Section title="Who can see this" icon="eye" defaultOpen={hasCondition(condition)}>
      {hasCondition(condition) && <span className={styles.badge}>{describeCondition(condition)}</span>}
      <WhoControl id={node.id} condition={condition} />
    </Section>
  )
}
