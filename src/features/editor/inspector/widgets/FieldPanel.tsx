import { Switch } from '@/shared/ui'
import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { codeName } from '../../model/data'
import { collectSubtreeIds, getElement } from '../../model/tree/queries'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { TextControl } from '../controls/TextControl'
import { Row } from './Row'

/** An input or a switch: the name its answer is sent under, whether it must be filled in, and (switches) on by default. */
export function FieldPanel({ widget }: { widget: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const input = collectSubtreeIds(nodes, widget.id).map((id) => getElement(nodes, id)).find((node) => node && (node.tag === 'input' || node.tag === 'textarea') && node.attrs.type !== 'hidden')
  if (!input) return null
  const isSwitch = widget.attrs['data-ui'] === 'switch'
  return (
    <>
      <Row label="Name" hint="The name the answer is sent under, in a form (and used in code)">
        <TextControl label="Field name" value={input.attrs.name ?? ''} onChange={(value) => setAttribute(input.id, 'name', codeName(value, ''))} />
      </Row>
      {isSwitch
        ? <Switch label="On at first" checked={'checked' in input.attrs} onChange={(on) => setAttributes(input.id, { checked: on ? 'checked' : '' })} />
        : <Switch label="Must be filled in" checked={'required' in input.attrs} onChange={(on) => setAttributes(input.id, { required: on ? 'required' : '' })} />}
    </>
  )
}
