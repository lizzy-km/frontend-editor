import { useMemo, useState } from 'react'
import { Button, Modal, Switch, TextField } from '@/shared/ui'
import { connectApi } from '../../actions/dataActions'
import { testApi, type ApiTestResult } from '../../model/apiTest'
import { parseJsonValue } from '../../model/dataImport'
import type { DataApi, DataSource } from '../../model/types'
import styles from './Data.module.css'

const KIND_NAMES = { text: 'text', longText: 'long text', number: 'number', boolean: 'yes / no', image: 'picture', date: 'date', url: 'link' }

/**
 * Connect a data source to a real API: address, an optional key, then Test connection.
 * A good answer shows the items and fields found; "Use these" keeps them as the sample data and remembers the address.
 * The key typed here is used for the test only: the page (and the download) read it from a setting in .env.
 */
export function ApiConnectDialog({ source, onClose }: { source: DataSource; onClose: () => void }) {
  const old = source.api
  const [url, setUrl] = useState(old?.url ?? '')
  const [needsKey, setNeedsKey] = useState(Boolean(old?.auth))
  const [header, setHeader] = useState(old?.auth?.header ?? 'Authorization')
  const [prefix, setPrefix] = useState(old?.auth?.prefix ?? 'Bearer ')
  const [envVar, setEnvVar] = useState(old?.auth?.envVar ?? 'VITE_API_KEY')
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)
  const auth: DataApi['auth'] = needsKey ? { header: header.trim() || 'Authorization', prefix, envVar: envVar.trim().replace(/[^A-Za-z0-9_]/g, '_') || 'VITE_API_KEY' } : undefined
  const parsed = useMemo(() => (result?.ok ? parseJsonValue(result.json) : null), [result])

  const test = async () => {
    setTesting(true)
    setResult(null)
    setResult(await testApi(url, auth, key))
    setTesting(false)
  }
  const use = () => {
    if (!parsed?.ok) return
    connectApi(source.id, { ...old, url: url.trim(), listPath: parsed.listPath || undefined, auth }, parsed)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={`Connect “${source.name}” to your API`} width={640}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!parsed?.ok} onClick={use}>{parsed?.ok ? `Use these ${parsed.rows.length} items` : 'Use these items'}</Button></>}>
      <div className={styles.dialog}>
        <p className={styles.hint}>Paste the web address your data comes from: a link that answers with a list of items (JSON), like <code>https://fakestoreapi.com/products</code>.</p>
        <TextField label="Address" value={url} placeholder="https://api.example.com/products" onChange={(event) => { setUrl(event.target.value); setResult(null) }} />
        <Switch label="This API needs a key" checked={needsKey} onChange={(on) => { setNeedsKey(on); setResult(null) }} />
        {needsKey && (
          <div className={styles.keyBox}>
            <TextField label="Header the key goes in" value={header} hint="Most APIs use Authorization." onChange={(event) => setHeader(event.target.value)} />
            <TextField label="Written before the key" value={prefix} hint="Usually “Bearer ” (with a space). Some APIs want nothing here." onChange={(event) => setPrefix(event.target.value)} />
            <TextField label="Name of the setting that holds your key" value={envVar} hint="Your downloaded project reads the key from this setting in its .env file, so it isn’t stored in the page. Visitors can still see it in their browser: use a key meant for websites (read-only or public), never a private one." onChange={(event) => setEnvVar(event.target.value)} />
            <TextField label="Your key (only for this test)" type="password" value={key} autoComplete="off" hint="Not saved anywhere." onChange={(event) => setKey(event.target.value)} />
          </div>
        )}
        <div className={styles.importTools}>
          <Button size="small" icon="globe" loading={testing} disabled={!url.trim() || testing} onClick={() => void test()}>Test connection</Button>
        </div>
        {result && !result.ok && <p role="alert" className={styles.problem}>{result.message}</p>}
        {result?.ok && parsed && !parsed.ok && <p role="alert" className={styles.problem}>It connected, but {parsed.error}</p>}
        {parsed?.ok && (
          <div className={styles.found} role="status">
            <p><strong>Connected.</strong> Found {parsed.rows.length} {parsed.rows.length === 1 ? 'item' : 'items'}{parsed.listPath ? <> in “{parsed.listPath}”</> : ''}, with {parsed.fields.length} fields:</p>
            <p className={styles.hint}>{parsed.fields.map((field) => `${field.name} (${KIND_NAMES[field.type]})`).join(', ')}</p>
            {parsed.notes.map((note) => <p key={note} className={styles.hint}>{note}</p>)}
            <p className={styles.hint}>“Use these” keeps these items as your sample data. The React download shows live data once you set <code>VITE_USE_MOCK=false</code> in its <code>.env</code> file (the README explains).</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
