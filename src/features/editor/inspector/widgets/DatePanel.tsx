import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { codeName } from '../../model/data'
import { collectSubtreeIds, getElement } from '../../model/tree/queries'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import { TextControl } from '../controls/TextControl'
import { Help, Row } from './Row'

const WEEK = [{ value: '1', label: 'Monday' }, { value: '0', label: 'Sunday' }, { value: '6', label: 'Saturday' }]
const FORMATS = [
  { value: 'YYYY-MM-DD', label: '2026-10-24' }, { value: 'DD/MM/YYYY', label: '24/10/2026' },
  { value: 'MM/DD/YYYY', label: '10/24/2026' }, { value: 'D MMM YYYY', label: '24 Oct 2026' },
]
const isDay = (text: string) => text === '' || /^\d{4}-\d{2}-\d{2}$/.test(text)

/** Calendar and date picker: first day of the week, date format, earliest and latest day, marked days. */
export function DatePanel({ widget }: { widget: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const picker = widget.attrs['data-ui'] === 'datepicker'
  const input = collectSubtreeIds(nodes, widget.id).map((id) => getElement(nodes, id)).find((node) => node && 'data-ui-input' in node.attrs)
  const set = (name: string, value: string) => setAttribute(widget.id, name, value)
  const day = (name: string) => (value: string) => isDay(value.trim()) && set(name, value.trim())
  const format = (value: string) => {
    set('data-ui-format', value)
    if (input) setAttributes(input.id, { placeholder: value })
  }
  return (
    <>
      <Row label="Week starts">
        <SelectControl label="Week starts on" value={widget.attrs['data-ui-week'] ?? '1'} options={WEEK} onChange={(value) => set('data-ui-week', value)} />
      </Row>
      {picker && (
        <Row label="Format" hint="How the chosen date is written in the box">
          <SelectControl label="Date format" value={widget.attrs['data-ui-format'] ?? 'YYYY-MM-DD'} options={FORMATS} onChange={format} />
        </Row>
      )}
      <Row label="Earliest day" hint="Days before this can't be picked. Write it as 2026-01-31">
        <TextControl label="Earliest day" value={widget.attrs['data-ui-min'] ?? ''} placeholder="2026-01-31" onChange={day('data-ui-min')} />
      </Row>
      <Row label="Latest day" hint="Days after this can't be picked">
        <TextControl label="Latest day" value={widget.attrs['data-ui-max'] ?? ''} placeholder="2026-12-31" onChange={day('data-ui-max')} />
      </Row>
      {!picker && (
        <Row label="Marked days" hint="Days that get a small dot: dates separated by commas">
          <TextControl label="Marked days" value={widget.attrs['data-ui-marks'] ?? ''} placeholder="2026-10-12, 2026-10-20" onChange={(value) => set('data-ui-marks', value.replace(/\s+/g, ''))} />
        </Row>
      )}
      {picker && input && (
        <Row label="Name" hint="The name the date is sent under, in a form (and used in code)">
          <TextControl label="Field name" value={input.attrs.name ?? ''} onChange={(value) => setAttribute(input.id, 'name', codeName(value, ''))} />
        </Row>
      )}
      <Help>The calendar opens on today’s month for visitors. Days outside the earliest and latest day are greyed out.</Help>
    </>
  )
}
