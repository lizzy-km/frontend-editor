import { useMemo, useRef, useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button } from '@/shared/ui'
import { importJson } from '../../actions/dataActions'
import { parseJsonData } from '../../model/dataImport'
import type { DataSource } from '../../model/types'
import styles from './Data.module.css'

const KIND_NAMES = { text: 'text', longText: 'long text', number: 'number', boolean: 'yes / no', image: 'picture', date: 'date', url: 'link' }

/** Paste JSON (an API answer or an export) or choose a .json file; see what was found; replace the data or add to it. */
export function JsonImport({ source, onDone }: { source: DataSource; onDone: () => void }) {
  const [text, setText] = useState('')
  const [fileError, setFileError] = useState('')
  const picker = useRef<HTMLInputElement>(null)
  const result = useMemo(() => (text.trim() ? parseJsonData(text) : null), [text])
  const has = source.rows.length > 0

  const readFile = (file: File) => {
    if (!/\.json$/i.test(file.name) && file.type !== 'application/json') { setFileError('Choose a .json file.'); return false }
    setFileError('')
    void file.text().then(setText)
    return true
  }
  const run = (mode: 'replace' | 'add') => {
    if (result?.ok) {
      importJson(source.id, result, mode)
      onDone()
    }
  }

  return (
    <div className={styles.import}>
      <p className={styles.hint}>
        Paste JSON from an API or an export, for example from <code>fakestoreapi.com/products</code>, or drop a file in the box. Every item becomes a row and every key a field.
      </p>
      <div className={styles.importTools}>
        <Button size="small" icon="upload" onClick={() => picker.current?.click()}>Choose a .json file</Button>
        <input ref={picker} type="file" accept=".json,application/json" hidden aria-label="JSON file"
          onChange={(event) => { const file = event.target.files?.[0]; if (file) readFile(file); event.target.value = '' }} />
      </div>
      <LazyCodeEditor label="JSON to import" language="js" value={text} onChange={setText} foldTools={false} minHeight="140px" maxHeight="260px"
        placeholder={'[\n  { "title": "Linen shirt", "price": 59, "image": "https://…" }\n]'} onDropFile={readFile} />
      {fileError && <p role="alert" className={styles.problem}>{fileError}</p>}
      {result && !result.ok && <p role="alert" className={styles.problem}>{result.error}</p>}
      {result?.ok && (
        <div className={styles.found} role="status">
          <p><strong>Found {result.rows.length} {result.rows.length === 1 ? 'item' : 'items'}</strong> with {result.fields.length} fields:</p>
          <p className={styles.hint}>{result.fields.map((field) => `${field.name} (${KIND_NAMES[field.type]})`).join(', ')}</p>
          {result.notes.map((note) => <p key={note} className={styles.hint}>{note}</p>)}
        </div>
      )}
      <div className={styles.importTools}>
        {has ? (
          <>
            <Button size="small" variant="primary" disabled={!result?.ok} onClick={() => run('add')}>Add to the rows I have</Button>
            <Button size="small" disabled={!result?.ok} onClick={() => run('replace')}>Replace everything</Button>
          </>
        ) : (
          <Button size="small" variant="primary" disabled={!result?.ok} onClick={() => run('replace')}>Import</Button>
        )}
        <Button size="small" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  )
}
