import { useState } from 'react'
import { Button } from '@/shared/ui'
import { makeMain } from '../../actions/reuseActions'
import { labelForNode } from '../../labels/elementLabels'
import { componentAround } from '../../model/reuse/attrs'
import { canMakeComponent } from '../../model/reuse/make'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'
import { ReuseCopy } from './ReuseCopy'
import { ReuseMain } from './ReuseMain'

/** Make a box a reusable component, or work with the component it belongs to (main component, a part of it, or a copy). */
export function ReuseSection({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const rootId = useDocStore((state) => state.doc.rootId)
  const [name, setName] = useState('')
  const around = componentAround(nodes, node.id)

  if (around?.kind === 'main') return <ReuseMain node={node} main={around.root} nodes={nodes} />
  if (around?.kind === 'instance') return <ReuseCopy node={node} copy={around.root} nodes={nodes} />
  if (!canMakeComponent(nodes, node.id, rootId)) return null
  const suggested = name || labelForNode(node).name
  return (
    <Section title="Component" icon="component" defaultOpen={false}>
      <p className={styles.label}>Turn this into a component to reuse it anywhere: change it once and every copy follows.</p>
      <div className={styles.row}><span className={styles.label}>Name</span><TextControl label="Component name" value={suggested} onChange={setName} /></div>
      <Button size="small" icon="plus" onClick={() => makeMain(node.id, suggested)}>Make a component</Button>
    </Section>
  )
}
