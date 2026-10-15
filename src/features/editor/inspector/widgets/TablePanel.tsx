import { Button, Switch } from '@/shared/ui'
import { updateNodes } from '../../actions/commit'
import { LIST_ATTR } from '../../model/dataLists'
import { changeColumns, changeRows, setAttrs, toggleClass } from '../../model/widgets/edit'
import { collectSubtreeIds, getElement } from '../../model/tree/queries'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { Help, Row } from './Row'

const LOOKS = [
  { cls: 'ui-table--striped', label: 'Striped rows' },
  { cls: 'ui-table--hover', label: 'Highlight a row under the mouse' },
  { cls: 'ui-table--compact', label: 'Tighter rows' },
]

/** A table: rows and columns, whether headings sort, and its look. */
export function TablePanel({ widget }: { widget: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const parts = collectSubtreeIds(nodes, widget.id).map((id) => getElement(nodes, id))
  const headings = parts.filter((node): node is ElementNode => node?.tag === 'th')
  const fromData = parts.some((node) => node && node.tag === 'tbody' && LIST_ATTR in node.attrs)
  const names = (widget.attrs.class ?? '').split(/\s+/)
  const sortable = headings.length > 0 && headings.every((heading) => 'data-ui-sort' in heading.attrs)
  const setSortable = (on: boolean) => updateNodes((current) => headings.reduce((next, heading) => setAttrs(next, heading.id, { 'data-ui-sort': on ? '' : null, tabindex: on ? '0' : null, 'aria-sort': null }), current))
  return (
    <>
      <Row label="Rows">
        <span style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon="plus" disabled={fromData} onClick={() => updateNodes((current) => changeRows(current, widget.id, true))}>Add</Button>
          <Button size="small" variant="ghost" disabled={fromData} onClick={() => updateNodes((current) => changeRows(current, widget.id, false))}>Remove last</Button>
        </span>
      </Row>
      <Row label="Columns">
        <span style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon="plus" disabled={fromData} onClick={() => updateNodes((current) => changeColumns(current, widget.id, true))}>Add</Button>
          <Button size="small" variant="ghost" disabled={fromData} onClick={() => updateNodes((current) => changeColumns(current, widget.id, false))}>Remove last</Button>
        </span>
      </Row>
      <Switch label="Click a heading to sort" checked={sortable} onChange={setSortable} />
      {LOOKS.map(({ cls, label }) => (
        <Switch key={cls} label={label} checked={names.includes(cls)} onChange={(on) => updateNodes((current) => toggleClass(current, widget.id, cls, on))} />
      ))}
      <Help>{fromData ? 'The rows come from your data: change them in the Data tab. Click a cell to change how a column looks.' : 'Click any cell to type in it. Rows and columns are added at the end.'}</Help>
    </>
  )
}
