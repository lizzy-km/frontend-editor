import { Button } from '@/shared/ui'
import { addInstance, editComponent, releaseMain, renameMain } from '../../actions/reuseActions'
import { nameOption } from '../../actions/lookActions'
import { COMPONENT_ATTR, PART_ATTR, instancesOf, looksOf, lookName } from '../../model/reuse/attrs'
import type { ElementNode, NodeMap } from '../../model/types'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

const buttons = { display: 'flex', flexWrap: 'wrap', gap: 8 } as const

/** A main component (its top box), or a box inside one: where it is named, edited on its own, and where a part becomes an option. */
export function ReuseMain({ node, main, nodes }: { node: ElementNode; main: ElementNode; nodes: NodeMap }) {
  if (node.id !== main.id) {
    return (
      <Section title={`Part of “${main.attrs[COMPONENT_ATTR]}”`} icon="component" defaultOpen={Boolean(node.attrs[PART_ATTR])}>
        <div className={styles.row} title="Give this part a name to let every copy show or hide it">
          <span className={styles.label}>Option</span>
          <TextControl label="Option name" value={node.attrs[PART_ATTR] ?? ''} placeholder="e.g. Picture" onChange={(value) => nameOption(node.id, value)} />
        </div>
        <p className={styles.label}>With a name, each copy gets a switch to show or hide this part (Actions → Component on the copy).</p>
        <Button size="small" variant="ghost" onClick={() => editComponent(main.id)}>Edit the component on its own</Button>
      </Section>
    )
  }
  const looks = looksOf(nodes, main)
  const count = instancesOf(nodes, main.id).length
  return (
    <Section title="Component (main)" icon="component">
      <div className={styles.row}>
        <span className={styles.label}>Name</span>
        <TextControl label="Component name" value={main.attrs[COMPONENT_ATTR] ?? ''} onChange={(value) => renameMain(main.id, value)} />
      </div>
      {looks.length > 1 && <p className={styles.label}>This is the look “{lookName(main)}” (one of {looks.length}). Add and rename looks in the Components tab.</p>}
      <p className={styles.label}>
        This is the main component: it is only for editing and never shows on your page. Change it and {count === 1 ? 'its copy follows' : `its ${count} copies follow`}, except for what a copy changed itself.
      </p>
      <div style={buttons}>
        <Button size="small" variant="primary" icon="pencil" onClick={() => editComponent(main.id)}>Edit on its own</Button>
        <Button size="small" icon="plus" onClick={() => addInstance(main.id)}>Add a copy</Button>
        <Button size="small" variant="ghost" onClick={() => releaseMain(main.id)}>Stop being a component</Button>
      </div>
    </Section>
  )
}
