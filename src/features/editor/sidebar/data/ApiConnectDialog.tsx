import { useMemo, useState } from 'react'
import { Button, Modal, Switch, TextField } from '@/shared/ui'
import { connectApi } from '../../actions/dataActions'
import { fillAddress, hasToken, itemPathOf, readPath, testApi, type ApiTestResult } from '../../model/apiTest'
import { parseJsonValue } from '../../model/dataImport'
import type { DataApi, DataField, DataSource } from '../../model/types'
import styles from './Data.module.css'

const KIND_NAMES = { text: 'text', longText: 'long text', number: 'number', boolean: 'yes / no', image: 'picture', date: 'date', url: 'link' }

type ItemResult = { ok: true; path: string; missing: string[]; id: string } | { ok: false; message: string }

/** Does a one-item answer have what the list's fields expect? Returns the fields it lacks. */
const missingIn = (fields: DataField[], item: unknown) => fields.filter((field) => readPath(item, field.from ?? field.name) === undefined).map((field) => field.name)

/**
 * Connect a data source to a real API: the list address, an optional address for ONE item (with :id), an optional key,
 * then Test connection. A good answer shows the items and fields found; "Use these" remembers the settings and keeps the items as samples.
 * The key typed here is used for the test only: the page (and the download) read it from a setting in .env.
 */
export function ApiConnectDialog({ source, onClose }: { source: DataSource; onClose: () => void }) {
  const old = source.api
  const [url, setUrl] = useState(old?.url ?? '')
  const [itemUrl, setItemUrl] = useState(old?.itemUrl ?? '')
  const [tryId, setTryId] = useState('')
  const [needsKey, setNeedsKey] = useState(Boolean(old?.auth))
  const [header, setHeader] = useState(old?.auth?.header ?? 'Authorization')
  const [prefix, setPrefix] = useState(old?.auth?.prefix ?? 'Bearer ')
  const [envVar, setEnvVar] = useState(old?.auth?.envVar ?? 'VITE_API_KEY')
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<ApiTestResult | null>(null)
  const [item, setItem] = useState<ItemResult | null>(null)
  const auth: DataApi['auth'] = needsKey ? { header: header.trim() || 'Authorization', prefix, envVar: envVar.trim().replace(/[^A-Za-z0-9_]/g, '_') || 'VITE_API_KEY' } : undefined
  const parsed = useMemo(() => (result?.ok ? parseJsonValue(result.json) : null), [result])
  const listHasToken = hasToken(url)
  const reset = () => { setResult(null); setItem(null) }

  const test = async () => {
    setTesting(true)
    reset()
    const list = await testApi(url, auth, key)
    setResult(list)
    if (itemUrl.trim()) setItem(await testItem(list))
    setTesting(false)
  }
  /** One item from the one-item address, tried with the id typed (or the first item's id). */
  const testItem = async (list: ApiTestResult): Promise<ItemResult> => {
    if (!hasToken(itemUrl)) return { ok: false, message: 'Write :id where the item’s id goes, like https://api.example.com/products/:id.' }
    const rows = list.ok ? parseJsonValue(list.json) : null
    const id = tryId.trim() || String(rows?.ok ? rows.rows[0]?.id ?? 1 : 1)
    const answer = await testApi(fillAddress(itemUrl, id), auth, key)
    if (!answer.ok) return { ok: false, message: `One item (id ${id}): ${answer.message}` }
    const path = itemPathOf(answer.json)
    return { ok: true, path, id, missing: rows?.ok ? missingIn(rows.fields, path ? readPath(answer.json, path) : answer.json) : [] }
  }
  const use = () => {
    if (!parsed?.ok) return
    connectApi(source.id, { ...old, url: url.trim(), listPath: parsed.listPath || undefined, itemUrl: itemUrl.trim() || undefined, itemPath: item?.ok && item.path ? item.path : undefined, auth }, parsed)
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={`Connect “${source.name}” to your API`} width={640}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!parsed?.ok} onClick={use}>{parsed?.ok ? `Use these ${parsed.rows.length} items` : 'Use these items'}</Button></>}>
      <div className={styles.dialog}>
        <p className={styles.hint}>Paste the web address your data comes from: a link that answers with a list of items (JSON), like <code>https://fakestoreapi.com/products</code>.</p>
        <TextField label="Address for the list" value={url} placeholder="https://api.example.com/products" onChange={(event) => { setUrl(event.target.value); reset() }} />
        {listHasToken && (
          <div className={styles.found}>
            <p className={styles.problem}>This address has a changing part (<code>:id</code>), so it is for ONE item, not the list.</p>
            <Button size="small" onClick={() => { setItemUrl(url); setUrl(''); reset() }}>Use it as the address for one item</Button>
          </div>
        )}
        <TextField label="Address for one item (optional)" value={itemUrl} placeholder="https://api.example.com/products/:id"
          hint="For detail pages. Write :id where the item’s id goes: the page for item 3 then asks https://api.example.com/products/3 instead of loading everything."
          onChange={(event) => { setItemUrl(event.target.value); setItem(null) }} />
        {itemUrl.trim() && <TextField label="Try the one-item address with id" value={tryId} placeholder="the first item’s id" hint="Used for the test only." onChange={(event) => setTryId(event.target.value)} />}
        <Switch label="This API needs a key" checked={needsKey} onChange={(on) => { setNeedsKey(on); reset() }} />
        {needsKey && (
          <div className={styles.keyBox}>
            <TextField label="Header the key goes in" value={header} hint="Most APIs use Authorization." onChange={(event) => setHeader(event.target.value)} />
            <TextField label="Written before the key" value={prefix} hint="Usually “Bearer ” (with a space). Some APIs want nothing here." onChange={(event) => setPrefix(event.target.value)} />
            <TextField label="Name of the setting that holds your key" value={envVar} hint="Your downloaded project reads the key from this setting in its .env file, so it isn’t stored in the page. Visitors can still see it in their browser: use a key meant for websites (read-only or public), never a private one." onChange={(event) => setEnvVar(event.target.value)} />
            <TextField label="Your key (only for this test)" type="password" value={key} autoComplete="off" hint="Not saved anywhere." onChange={(event) => setKey(event.target.value)} />
          </div>
        )}
        <div className={styles.importTools}>
          <Button size="small" icon="globe" loading={testing} disabled={!url.trim() || listHasToken || testing} onClick={() => void test()}>Test connection</Button>
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
        {item && !item.ok && <p role="alert" className={styles.problem}>{item.message}</p>}
        {item?.ok && (
          <div className={styles.found} role="status" aria-label="One item test">
            <p><strong>One item works.</strong> Item {item.id} came back{item.path ? <> inside “{item.path}”</> : ''}.</p>
            {item.missing.length > 0 && <p className={styles.hint}>These fields were not in it, so they stay empty on a detail page: {item.missing.join(', ')}.</p>}
          </div>
        )}
      </div>
    </Modal>
  )
}
