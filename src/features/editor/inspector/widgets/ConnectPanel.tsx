import { useMemo } from 'react'
import { updateDoc } from '../../actions/commit'
import { filterByField, filterFields, targetBox } from '../../model/widgets/filterData'
import { filterTargets, nameTarget, pointAt } from '../../model/widgets/connect'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import { Help, Row } from './Row'

/** A search bar or filter: which list or table it acts on, and (filters) which data field it offers. */
export function ConnectPanel({ widget }: { widget: ElementNode }) {
  const doc = useDocStore((state) => state.doc)
  const targets = useMemo(() => filterTargets(doc.nodes), [doc.nodes])
  const name = widget.attrs['data-ui-for'] ?? ''
  const isFilter = widget.attrs['data-ui'] === 'filter'
  const found = name ? targetBox(doc, name) : null
  const connect = (value: string) => updateDoc((current) => {
    const target = targets.find((item) => item.name === value)
    return { ...current, nodes: pointAt(target ? nameTarget(current.nodes, target) : current.nodes, widget.id, target ? target.name : '') }
  })
  const options = [{ value: '', label: 'Not connected' }, ...targets.map((target) => ({ value: target.name, label: target.label }))]
  const fields = [{ value: '', label: 'Any text in the item' }, ...(found ? filterFields(found.source).map((field) => ({ value: field.name, label: field.name })) : [])]
  return (
    <>
      <Row label="Works on" hint="The list or table that this narrows down">
        <SelectControl label="Works on" value={name} options={options} onChange={connect} />
      </Row>
      {isFilter && (
        <Row label="Filter by" hint="With a data field, the choices become the real values of that field">
          <SelectControl label="Filter by" value={widget.attrs['data-ui-by'] ?? ''} options={fields} onChange={(field) => updateDoc((current) => filterByField(current, widget.id, field))} />
        </Row>
      )}
      <Help>
        {targets.length ? 'Works with “List from data” and “Table from data”, and with a typed table. Set a list to show all items so every one can be found.' : 'Add a “List from data” or a table to the page first.'}
        {isFilter && found ? ' Choosing a field replaces the buttons with that field’s values.' : ''}
      </Help>
    </>
  )
}
