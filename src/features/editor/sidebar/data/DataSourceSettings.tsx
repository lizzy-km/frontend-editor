import { Button } from '@/shared/ui'
import { renameSource, setSourceApi } from '../../actions/dataActions'
import { rowTypeName } from '../../model/data'
import type { DataApi, DataSource } from '../../model/types'
import { TextControl } from '../../inspector/controls/TextControl'
import styles from './Data.module.css'

/** Name, fields and rows (in a table), and where the real data comes from. */
export function DataSourceSettings({ source, onEditTable }: { source: DataSource; onEditTable: () => void }) {
  const api: DataApi = source.api ?? { url: '' }
  const setApi = (change: Partial<DataApi>) => {
    const next = { ...api, ...change }
    setSourceApi(source.id, next.url || next.listPath || next.pageParam ? next : undefined)
  }
  return (
    <div className={styles.settings}>
      <label className={styles.field}>
        <span>Name (used in code)</span>
        <TextControl label="Data name" value={source.name} onChange={(name) => renameSource(source.id, name)} />
      </label>
      <p className={styles.hint}>Each row is a <code>{rowTypeName(source.name)}</code>: {source.fields.map((f) => `${f.name} (${f.type})`).join(', ') || 'no fields yet'}.</p>
      <Button size="small" icon="pencil" onClick={onEditTable}>Edit fields and rows</Button>

      <p className={styles.settingsTitle}>Real data (optional)</p>
      <label className={styles.field} title="A GET address that returns the list as JSON">
        <span>API address</span>
        <TextControl label="API address" value={api.url} placeholder="https://api.example.com/products" onChange={(url) => setApi({ url })} />
      </label>
      <label className={styles.field} title='Where the list is inside the answer, e.g. "data.items". Empty = the answer is the list.'>
        <span>List is at</span>
        <TextControl label="List path" value={api.listPath ?? ''} placeholder="data.items" onChange={(listPath) => setApi({ listPath })} />
      </label>
      <div className={styles.pair}>
        <label className={styles.field}>
          <span>Page parameter</span>
          <TextControl label="Page parameter" value={api.pageParam ?? ''} placeholder="page" onChange={(pageParam) => setApi({ pageParam })} />
        </label>
        <label className={styles.field}>
          <span>Page size parameter</span>
          <TextControl label="Page size parameter" value={api.pageSizeParam ?? ''} placeholder="limit" onChange={(pageSizeParam) => setApi({ pageSizeParam })} />
        </label>
      </div>
      <p className={styles.hint}>The React download uses the sample rows until you set <code>VITE_USE_MOCK=false</code>.</p>
    </div>
  )
}
