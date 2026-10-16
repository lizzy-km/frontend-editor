import { useState } from 'react'
import { Button } from '@/shared/ui'
import { addInstance, detach, editComponent, makeMain, releaseMain, renameMain, resetOverrides } from '../../actions/reuseActions'
import { COMPONENT_ATTR, componentAround, instancesOf, mainOf } from '../../model/reuse/attrs'
import { canMakeComponent } from '../../model/reuse/make'
import { labelForNode } from '../../labels/elementLabels'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { useSelectionStore } from '../../store/selection.store'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

const buttons = { display: 'flex', flexWrap: 'wrap', gap: 8 } as const

/** Make a box a reusable component, or work with a component it belongs to (main component or copy). */
export function ReuseSection({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const rootId = useDocStore((state) => state.doc.rootId)
  const select = useSelectionStore((state) => state.select)
  const [name, setName] = useState('')
  const around = componentAround(nodes, node.id)

  if (!around) {
    if (!canMakeComponent(nodes, node.id, rootId)) return null
    const suggested = name || labelForNode(node).name
    return (
      <Section title="Component" icon="layers" defaultOpen={false}>
        <p className={styles.label}>Turn this into a component to reuse it anywhere: change it once and every copy follows.</p>
        <div className={styles.row}><span className={styles.label}>Name</span><TextControl label="Component name" value={suggested} onChange={setName} /></div>
        <Button size="small" icon="plus" onClick={() => makeMain(node.id, suggested)}>Make a component</Button>
      </Section>
    )
  }

  if (around.kind === 'main') {
    const count = instancesOf(nodes, around.root.id).length
    return (
      <Section title="Component (main)" icon="layers">
        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <TextControl label="Component name" value={around.root.attrs[COMPONENT_ATTR] ?? ''} onChange={(value) => renameMain(around.root.id, value)} />
        </div>
        <p className={styles.label}>
          This is the main component: it is only for editing and never shows on your page. Change it and {count === 1 ? 'its copy follows' : `its ${count} copies follow`}, except for what a copy changed itself.
        </p>
        <div style={buttons}>
          <Button size="small" variant="primary" icon="pencil" onClick={() => editComponent(around.root.id)}>Edit on its own</Button>
          <Button size="small" icon="plus" onClick={() => addInstance(around.root.id)}>Add a copy</Button>
          <Button size="small" variant="ghost" onClick={() => releaseMain(around.root.id)}>Stop being a component</Button>
        </div>
      </Section>
    )
  }

  const main = mainOf(nodes, around.root)
  return (
    <Section title="Component (copy)" icon="layers">
      <p className={styles.label}>
        {main ? `A copy of “${main.attrs[COMPONENT_ATTR]}”. Change its words, pictures, links or looks here and only this copy changes; everything else follows the main component.` : 'The main component is gone.'}
      </p>
      <p className={styles.label}>To show different data, select the copy and use Data to pick an item or a list.</p>
      <div style={buttons}>
        {main && <Button size="small" variant="primary" icon="pencil" onClick={() => editComponent(main.id)}>Edit the main component</Button>}
        {main && <Button size="small" variant="ghost" onClick={() => select(main.id)}>Go to the main component</Button>}
        {main && <Button size="small" variant="ghost" onClick={() => resetOverrides(around.root.id)}>Undo my changes to this copy</Button>}
        <Button size="small" variant="ghost" onClick={() => detach(around.root.id)}>Make it a normal box</Button>
      </div>
    </Section>
  )
}
