import { setAttribute } from '../../actions/nodeActions'
import { describeNode } from '../../labels/elementLabels'
import { BIND_ATTR, BIND_PREFIX, bindingsOf } from '../../model/dataLists'
import { bindableParts, fieldTypesFor } from '../../model/dataRecords'
import type { PageInfo } from '../../model/pages'
import { isDynamicPath } from '../../model/routes'
import type { DataSource, ElementNode, NodeMap } from '../../model/types'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'

/** One select per thing a part can show: its text, or a picture's source and description, or a link's address. */
function partRows(part: ElementNode, source: DataSource, label: string, pages: PageInfo[]) {
  const bindings = bindingsOf(part)
  const options = (attr: string) => [
    { value: '', label: 'Nothing (keep as designed)' },
    ...source.fields.filter((field) => fieldTypesFor(attr).includes(field.type)).map((field) => ({ value: field.name, label: field.name })),
    // Links can open a page with a changing part: /products/:id gets each row's id.
    ...(attr === `${BIND_PREFIX}href` ? pages.filter((page) => isDynamicPath(page.path)).map((page) => ({ value: page.path, label: `Page “${page.title}” (${page.path})` })) : []),
  ]
  const row = (name: string, attr: string, value: string) => (
    <div key={attr} className={styles.row}>
      <span className={styles.label}>{name}</span>
      <SelectControl label={`${label} ${name.toLowerCase()} from data`} value={value} options={options(attr === BIND_ATTR ? 'text' : attr.slice(BIND_PREFIX.length))}
        onChange={(field) => setAttribute(part.id, attr, field)} />
    </div>
  )
  if (part.tag === 'img') return [row('Picture', `${BIND_PREFIX}src`, bindings.src ?? ''), row('Description', `${BIND_PREFIX}alt`, bindings.alt ?? '')]
  return [row('Text', BIND_ATTR, bindings.text ?? ''), ...(part.tag === 'a' ? [row('Goes to', `${BIND_PREFIX}href`, bindings.href ?? '')] : [])]
}

/** Which field each picture and piece of text inside the box shows. */
export function FieldMap({ nodes, boxId, source, pages }: { nodes: NodeMap; boxId: string; source: DataSource; pages: PageInfo[] }) {
  const parts = bindableParts(nodes, boxId)
  if (parts.length === 0) return <p className={styles.label}>Add some text or a picture inside this box to show your data.</p>
  return (
    <>
      {parts.map((part) => {
        const label = describeNode(nodes, part, 20)
        return (
          <div key={part.id} role="group" aria-label={label}>
            <p className={styles.label}><strong>{label}</strong></p>
            {partRows(part, source, label, pages)}
          </div>
        )
      })}
    </>
  )
}
