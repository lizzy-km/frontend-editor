import { useState } from 'react'
import { Button } from '@/shared/ui'
import { renameSource, setSourceApi } from '../../actions/dataActions'
import { rowTypeName } from '../../model/data'
import type { DataApi, DataSource } from '../../model/types'
import { TextControl } from '../../inspector/controls/TextControl'
import { ApiConnectDialog } from './ApiConnectDialog'
import styles from './Data.module.css'

/** Name, fields and rows (in a table), and where the real data comes from. */
export function DataSourceSettings({ source, onEditTable }: { source: DataSource; onEditTable: () => void }) {
  const api: DataApi = source.api ?? { url: '' }
  const [connecting, setConnecting] = useState(false)
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
      {api.url
        ? <p className={styles.hint}>Connected to <strong>{new URL(api.url, 'https://x.test').host}</strong>{api.auth ? <>, with a key from <code>{api.auth.envVar}</code></> : ''}{api.itemUrl ? <>. Detail pages ask for one item at a time.</> : '.'}</p>
        : <p className={styles.hint}>Using sample items. Connect your own API to show live data in the React download.</p>}
      <Button size="small" icon="globe" variant={api.url ? 'secondary' : 'primary'} onClick={() => setConnecting(true)}>{api.url ? 'Change or test the connection' : 'Connect your API'}</Button>
      {connecting && <ApiConnectDialog source={source} onClose={() => setConnecting(false)} />}
      <details className={styles.more}>
        <summary>More options</summary>
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
      </details>
      <p className={styles.hint}>The React download uses the sample items until you set <code>VITE_USE_MOCK=false</code> in its <code>.env</code> file.</p>
    </div>
  )
}
