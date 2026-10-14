import { useState } from 'react'
import { Button, Icon, Modal } from '@/shared/ui'
import { deleteField, deleteRow, editCell, editField, newField, newRow } from '../../actions/dataActions'
import type { DataField, DataSource, DataValue, FieldType } from '../../model/types'
import styles from './Data.module.css'

const TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' }, { value: 'longText', label: 'Long text' }, { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes / no' }, { value: 'image', label: 'Picture link' }, { value: 'date', label: 'Date' }, { value: 'url', label: 'Link' },
]

function Cell({ source, row, field, value }: { source: DataSource; row: number; field: DataField; value: DataValue | undefined }) {
  const label = `${field.name}, row ${row + 1}`
  if (field.type === 'boolean') return <input type="checkbox" aria-label={label} checked={value === true} onChange={(event) => editCell(source.id, row, field, event.target.checked)} />
  const type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
  return <input className={styles.cell} type={type} aria-label={label} value={String(value ?? '')} onChange={(event) => editCell(source.id, row, field, event.target.value)} />
}

/** The fields (columns, with their kind) and the sample rows of one data source. */
export function DataTableDialog({ source, onClose }: { source: DataSource; onClose: () => void }) {
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')
  const addField = () => {
    if (!fieldName.trim()) return
    newField(source.id, { name: fieldName, type: fieldType })
    setFieldName('')
  }

  return (
    <Modal open onClose={onClose} title={`Data: ${source.name}`} width={980} footer={<Button variant="primary" onClick={onClose}>Done</Button>}>
      <div className={styles.dialog}>
        <p className={styles.settingsTitle}>Fields</p>
        <div className={styles.fields}>
          {source.fields.map((field, index) => (
            <div key={index} className={styles.fieldRow}>
              <input className={styles.cell} aria-label={`Field ${index + 1} name`} value={field.name} onChange={(event) => editField(source.id, index, { name: event.target.value })} />
              <select className={styles.select} aria-label={`Field ${index + 1} kind`} value={field.type} onChange={(event) => editField(source.id, index, { type: event.target.value as FieldType })}>
                {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <button type="button" className={styles.iconButton} aria-label={`Delete field ${field.name}`} onClick={() => deleteField(source.id, index)}><Icon name="trash" size={14} /></button>
            </div>
          ))}
          <div className={styles.fieldRow}>
            <input className={styles.cell} aria-label="New field name" placeholder="New field, e.g. price" value={fieldName}
              onChange={(event) => setFieldName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addField()} />
            <select className={styles.select} aria-label="New field kind" value={fieldType} onChange={(event) => setFieldType(event.target.value as FieldType)}>
              {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <Button size="small" icon="plus" onClick={addField} disabled={!fieldName.trim()}>Add field</Button>
          </div>
        </div>

        <p className={styles.settingsTitle}>Sample rows ({source.rows.length})</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>{source.fields.map((field) => <th key={field.name}>{field.name}</th>)}<th aria-label="Actions" /></tr></thead>
            <tbody>
              {source.rows.map((row, index) => (
                <tr key={index}>
                  {source.fields.map((field) => <td key={field.name}><Cell source={source} row={index} field={field} value={row[field.name]} /></td>)}
                  <td><button type="button" className={styles.iconButton} aria-label={`Delete row ${index + 1}`} onClick={() => deleteRow(source.id, index)}><Icon name="trash" size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button size="small" icon="plus" onClick={() => newRow(source.id)}>Add row</Button>
      </div>
    </Modal>
  )
}
