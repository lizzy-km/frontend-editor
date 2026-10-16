import { Button, Switch } from '@/shared/ui'
import { showOption, switchLook } from '../../actions/lookActions'
import { detach, editComponent, resetOverrides } from '../../actions/reuseActions'
import { COMPONENT_ATTR, looksOf, lookName, mainOf } from '../../model/reuse/attrs'
import { partShown, partsOf } from '../../model/reuse/looks'
import type { ElementNode, NodeMap } from '../../model/types'
import styles from '../controls/Controls.module.css'
import { SelectControl } from '../controls/ChoiceControls'
import { Section } from '../Section'

const buttons = { display: 'flex', flexWrap: 'wrap', gap: 8 } as const

/** A copy of a component: which look it uses, its options, and the ways back to the main component. */
export function ReuseCopy({ node, copy, nodes }: { node: ElementNode; copy: ElementNode; nodes: NodeMap }) {
  const main = mainOf(nodes, copy)
  const looks = main ? looksOf(nodes, main) : []
  const parts = main ? partsOf(nodes, main.id) : []
  return (
    <Section title="Component (copy)" icon="component" defaultOpen={node.id === copy.id}>
      <p className={styles.label}>
        {main ? `A copy of “${main.attrs[COMPONENT_ATTR]}”. Change its words, pictures, links or looks here and only this copy changes; everything else follows the main component.` : 'The main component is gone.'}
      </p>
      {main && looks.length > 1 && (
        <div className={styles.row} title="Switch this copy to another design of the component">
          <span className={styles.label}>Look</span>
          <SelectControl label="Look of this copy" value={main.id} options={looks.map((look) => ({ value: look.id, label: lookName(look) }))} onChange={(id) => switchLook(copy.id, id)} />
        </div>
      )}
      {parts.map((part) => <Switch key={part.id} label={`Show “${part.name}”`} checked={partShown(nodes, copy.id, part.id)} onChange={(shown) => showOption(copy.id, part.id, shown)} />)}
      <p className={styles.label}>To show different data, select the copy and use Data to pick an item or a list.</p>
      <div style={buttons}>
        {main && <Button size="small" variant="primary" icon="pencil" onClick={() => editComponent(main.id)}>Edit the main component</Button>}
        {main && <Button size="small" variant="ghost" onClick={() => resetOverrides(copy.id)}>Undo my changes to this copy</Button>}
        <Button size="small" variant="ghost" onClick={() => detach(copy.id)}>Make it a normal box</Button>
      </div>
    </Section>
  )
}
