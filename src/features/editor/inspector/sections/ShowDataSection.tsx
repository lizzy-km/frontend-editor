import { setAttribute } from '../../actions/nodeActions'
import { BIND_ATTR, BIND_PREFIX, bindingsOf, type ListInfo } from '../../model/dataLists'
import type { DataSource, ElementNode, FieldType } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { Section } from '../Section'

const EMPTY: DataSource[] = []
const TEXT_TYPES: FieldType[] = ['text', 'longText', 'number', 'boolean', 'date', 'url']

/** What a part of the card shows from the data (its own text, or a field). */
export function ShowDataSection({ node, list }: { node: ElementNode; list: ListInfo }) {
  const source = useDocStore((state) => (state.doc.data ?? EMPTY).find((item) => item.name === list.source))
  if (!source) return null
  const bindings = bindingsOf(node)
  const fields = (types?: FieldType[]) => [
    { value: '', label: 'Nothing (keep as designed)' },
    ...source.fields.filter((field) => !types || types.includes(field.type)).map((field) => ({ value: field.name, label: field.name })),
  ]
  const row = (label: string, attr: string, value: string, types?: FieldType[]) => (
    <div className={styles.row} key={attr}>
      <span className={styles.label}>{label}</span>
      <SelectControl label={`${label} from data`} value={value} options={fields(types)} onChange={(field) => setAttribute(node.id, attr, field)} />
    </div>
  )
  return (
    <Section title="Show data" icon="box">
      {node.tag === 'img' ? (
        <>
          {row('Picture', `${BIND_PREFIX}src`, bindings.src ?? '', ['image', 'url'])}
          {row('Description', `${BIND_PREFIX}alt`, bindings.alt ?? '', TEXT_TYPES)}
        </>
      ) : (
        row('Text', BIND_ATTR, bindings.text ?? '', TEXT_TYPES)
      )}
      {node.tag === 'a' && row('Goes to', `${BIND_PREFIX}href`, bindings.href ?? '', ['url', 'text'])}
      <p className={styles.label}>Each card shows its own row of “{source.name}”.</p>
    </Section>
  )
}
