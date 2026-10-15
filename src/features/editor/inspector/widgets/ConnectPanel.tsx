import { useMemo } from 'react'
import { updateDoc } from '../../actions/commit'
import { choicesOf, filterByField, filterFields, targetBox } from '../../model/widgets/filterData'
import { filterTargets, nameTarget, pointAt } from '../../model/widgets/connect'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import { Help, Row } from './Row'

/** A search bar or filter: which list or table it acts on, and (filters) which data field it matches and where its choices come from. */
export function ConnectPanel({ widget }: { widget: ElementNode }) {
  const doc = useDocStore((state) => state.doc)
  const targets = useMemo(() => filterTargets(doc.nodes), [doc.nodes])
  const name = widget.attrs['data-ui-for'] ?? ''
  const isFilter = widget.attrs['data-ui'] === 'filter'
  const found = name ? targetBox(doc, name) : null
  const by = widget.attrs['data-ui-by'] ?? ''
  const choices = choicesOf(widget)
  const choiceSource = choices && doc.data?.find((item) => item.name === choices.source)
  const connect = (value: string) => updateDoc((current) => {
    const target = targets.find((item) => item.name === value)
    return { ...current, nodes: pointAt(target ? nameTarget(current.nodes, target) : current.nodes, widget.id, target ? target.name : '') }
  })
  const apply = (field: string, from: { source: string; field: string } | null) => updateDoc((current) => filterByField(current, widget.id, field, from))
  const firstText = (source: string) => {
    const fields = filterFields(doc.data?.find((item) => item.name === source) ?? { id: '', name: '', fields: [], rows: [] })
    return (fields.find((field) => field.type === 'text') ?? fields[0])?.name ?? ''
  }
  const options = [{ value: '', label: 'Not connected' }, ...targets.map((target) => ({ value: target.name, label: target.label }))]
  const fields = [{ value: '', label: 'Any text in the item' }, ...(found ? filterFields(found.source).map((field) => ({ value: field.name, label: field.name })) : [])]
  const sources = [{ value: '', label: 'The values of that field in the items' }, ...(doc.data ?? []).map((item) => ({ value: item.name, label: `Another list: ${item.name}` }))]
  return (
    <>
      <Row label="Works on" hint="The list or table that this narrows down">
        <SelectControl label="Works on" value={name} options={options} onChange={connect} />
      </Row>
      {isFilter && (
        <>
          <Row label="Filter by" hint="The field of each item that the choices are matched against">
            <SelectControl label="Filter by" value={by} options={fields} onChange={(field) => apply(field, choices)} />
          </Row>
          <Row label="Choices from" hint="Where the buttons come from: the items themselves, or another data list such as your categories">
            <SelectControl label="Choices from" value={choices?.source ?? ''} options={sources}
              onChange={(source) => apply(by, source ? { source, field: firstText(source) } : null)} />
          </Row>
          {choiceSource && (
            <Row label="Show" hint="The field of that list used for the buttons' words">
              <SelectControl label="Choice words from" value={choices.field}
                options={filterFields(choiceSource).map((field) => ({ value: field.name, label: field.name }))} onChange={(field) => apply(by, { source: choiceSource.name, field })} />
            </Row>
          )}
        </>
      )}
      <Help>
        {targets.length ? 'Works with “List from data” and “Table from data”, and with a typed table. Set a list to show all items so every one can be found.' : 'Add a “List from data” or a table to the page first.'}
        {isFilter ? ' Choices from another list match the field you chose in “Filter by”: for example items with a “category” and a list of categories. Buttons and tick boxes stay in step with that list; a drop-down copies its values when you choose.' : ''}
      </Help>
    </>
  )
}
