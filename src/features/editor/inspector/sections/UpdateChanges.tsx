import { Button } from '@/shared/ui'
import { CHANGE_OPS, type ChangeOp, type UpdateChange } from '../../model/updateClicks'
import type { DataSource, FieldType } from '../../model/types'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'

/** Which ways of changing a field make sense: yes/no fields switch, numbers add, and only "set" works on an item picked by id. */
const opsFor = (type: FieldType | undefined, known: boolean) => CHANGE_OPS.filter((op) => op.value === 'set' || (known && (op.value === 'toggle' ? type === 'boolean' : type === 'number')))

/** The list of changes a click makes: a field, what to do with it, and the value. */
export function UpdateChanges({ source, changes, rowKnown, onChange }: { source: DataSource; changes: UpdateChange[]; rowKnown: boolean; onChange: (next: UpdateChange[]) => void }) {
  const edit = (index: number, part: Partial<UpdateChange>) => onChange(changes.map((change, at) => (at === index ? { ...change, ...part } : change)))
  const typeOf = (field: string) => source.fields.find((one) => one.name === field)?.type
  return (
    <>
      {changes.map((change, index) => {
        const ops = opsFor(typeOf(change.field), rowKnown)
        return (
          <div key={index} className={styles.row} role="group" aria-label={`Change ${index + 1}`}>
            <SelectControl label={`Field to change ${index + 1}`} value={change.field} options={source.fields.map((field) => ({ value: field.name, label: field.name }))}
              onChange={(field) => edit(index, { field, op: opsFor(typeOf(field), rowKnown).some((op) => op.value === change.op) ? change.op : 'set' })} />
            <SelectControl label={`What to do ${index + 1}`} value={change.op} options={ops} onChange={(op) => edit(index, { op: op as ChangeOp })} />
            {change.op !== 'toggle' && <TextControl label={`Value ${index + 1}`} value={change.value} placeholder={change.op === 'add' ? 'e.g. 1' : 'e.g. true, 5, Sold out'} onChange={(value) => edit(index, { value })} />}
            {changes.length > 1 && <Button size="small" variant="ghost" onClick={() => onChange(changes.filter((_, at) => at !== index))}>Remove</Button>}
          </div>
        )
      })}
      <Button size="small" variant="ghost" icon="plus" onClick={() => onChange([...changes, { field: source.fields[0]?.name ?? '', op: 'set', value: '' }])}>Add another change</Button>
    </>
  )
}
