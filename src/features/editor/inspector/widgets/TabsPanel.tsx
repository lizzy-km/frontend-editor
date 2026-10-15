import { Button } from '@/shared/ui'
import { updateNodes } from '../../actions/commit'
import { addTab, removeTab, setTabsStyle, tabsOf } from '../../model/widgets/edit'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import { Help, Row } from './Row'

const LOOKS = [
  { value: 'line', label: 'Underlined' }, { value: 'pills', label: 'Round buttons' },
  { value: 'boxed', label: 'In a grey bar' }, { value: 'side', label: 'Down the side' },
]

/** Tabs: how they look, and adding or removing a tab together with its panel. */
export function TabsPanel({ widget }: { widget: ElementNode }) {
  const count = useDocStore((state) => tabsOf(state.doc.nodes, widget.id).tabs.length)
  const look = /ui-tabs--(\w+)/.exec(widget.attrs.class ?? '')?.[1] ?? 'line'
  return (
    <>
      <Row label="Look">
        <SelectControl label="Tabs look" value={look} options={LOOKS} onChange={(value) => updateNodes((nodes) => setTabsStyle(nodes, widget.id, value))} />
      </Row>
      <Row label={`${count} tabs`}>
        <span style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon="plus" onClick={() => updateNodes((nodes) => addTab(nodes, widget.id))}>Add a tab</Button>
          <Button size="small" variant="ghost" disabled={count < 2} onClick={() => updateNodes((nodes) => removeTab(nodes, widget.id))}>Remove last</Button>
        </span>
      </Row>
      <Help>Click a tab on the page to see and edit its panel. Double-click its name to rename it. Put anything inside a panel.</Help>
    </>
  )
}
