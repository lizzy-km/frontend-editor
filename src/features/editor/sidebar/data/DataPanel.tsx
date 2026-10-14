import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { createSource, deleteSource } from '../../actions/dataActions'
import { DATA_PRESETS } from '../../model/dataPresets'
import type { DataSource } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { AuthApiSettings } from './AuthApiSettings'
import { DataSourceSettings } from './DataSourceSettings'
import { DataTableDialog } from './DataTableDialog'
import styles from './Data.module.css'

const EMPTY: DataSource[] = []

/** Data the page can show: lists of products, posts, people… with mock rows now and a real API later. */
export function DataPanel() {
  const sources = useDocStore((state) => state.doc.data ?? EMPTY)
  const [openId, setOpenId] = useState<string | null>(null)
  const [tableId, setTableId] = useState<string | null>(null)
  const [preset, setPreset] = useState(DATA_PRESETS[0]!.label)
  const open = sources.find((source) => source.id === openId) ?? sources[0] ?? null
  const table = sources.find((source) => source.id === tableId) ?? null

  const add = () => {
    const chosen = DATA_PRESETS.find((item) => item.label === preset) ?? DATA_PRESETS[0]!
    setOpenId(createSource(chosen.source, chosen.label))
  }
  const remove = (source: DataSource) =>
    window.confirm(`Delete the data “${source.name}”? Boxes that show it will be empty.`) && deleteSource(source.id)

  return (
    <div className={styles.panel}>
      <p className={styles.note}>Lists your page can show, like products or blog posts. Start with sample rows; connect a real API when you have one.</p>
      {sources.length > 0 && (
        <div className={styles.list} role="list" aria-label="Data">
          {sources.map((source) => (
            <div key={source.id} role="listitem" className={`${styles.row} ${source.id === open?.id ? styles.current : ''}`}>
              <button type="button" className={styles.open} onClick={() => setOpenId(source.id)}>
                <Icon name="box" size={15} />
                <span className={styles.name}>{source.name}</span>
                <span className={styles.meta}>{source.fields.length} fields · {source.rows.length} rows{source.api?.url ? ' · API' : ''}</span>
              </button>
              <button type="button" className={styles.iconButton} aria-label={`Delete ${source.name}`} onClick={() => remove(source)}><Icon name="trash" size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.add}>
        <select className={styles.select} aria-label="Start from" value={preset} onChange={(event) => setPreset(event.target.value)}>
          {DATA_PRESETS.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
        </select>
        <Button size="small" icon="plus" onClick={add}>Add data</Button>
      </div>
      {open && <DataSourceSettings key={open.id} source={open} onEditTable={() => setTableId(open.id)} />}
      <AuthApiSettings />
      {table && <DataTableDialog source={table} onClose={() => setTableId(null)} />}
    </div>
  )
}
