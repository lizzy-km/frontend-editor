import { useState } from 'react'
import { setAttribute } from '../../actions/nodeActions'
import { updateNodes } from '../../actions/commit'
import { codeName } from '../../model/data'
import { optionLines, setOptions } from '../../model/widgets/edit'
import { collectSubtreeIds, getElement } from '../../model/tree/queries'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import controls from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Help, Row } from './Row'

/** A select list: its choices (one per line) and the name the choice is sent under. */
export function SelectPanel({ widget }: { widget: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const saved = optionLines(nodes, widget.id).join('\n')
  const [draft, setDraft] = useState<string | null>(null)
  const field = collectSubtreeIds(nodes, widget.id).map((id) => getElement(nodes, id)).find((node) => node && 'data-ui-input' in node.attrs)
  const apply = () => { if (draft !== null && draft !== saved) updateNodes((current) => setOptions(current, widget.id, draft.split('\n'))); setDraft(null) }
  return (
    <>
      <label className={controls.label} htmlFor={`choices-${widget.id}`}>Choices (one per line)</label>
      <textarea id={`choices-${widget.id}`} className={controls.input} rows={6} style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
        value={draft ?? saved} onChange={(event) => setDraft(event.target.value)} onBlur={apply} />
      {field && (
        <Row label="Name" hint="The name the choice is sent under, in a form (and used in code)">
          <TextControl label="Field name" value={field.attrs.name ?? ''} onChange={(value) => setAttribute(field.id, 'name', codeName(value, ''))} />
        </Row>
      )}
      <Help>Click the box on the page to see the list and edit one choice’s look; every choice shares it.</Help>
    </>
  )
}
