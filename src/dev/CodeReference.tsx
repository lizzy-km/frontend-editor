import { useEffect, useMemo, useState } from 'react'
import { indexFile, type Entry, type FileDoc } from './codeIndex'
import { SOURCES } from './docsFiles'
import ref from './CodeReference.module.css'

const dirOf = (path: string) => path.slice(0, path.lastIndexOf('/'))
const nameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1)
const KIND_LABEL: Record<Entry['kind'], string> = { component: 'component', function: 'function', const: 'value', type: 'type', class: 'class' }

function EntryRow({ entry, path }: { entry: Entry; path: string }) {
  return (
    <li className={ref.entry}>
      <span className={ref.kind} data-kind={entry.kind}>{KIND_LABEL[entry.kind]}</span>
      <div>
        <strong>{entry.name}</strong>
        <small> {path.replace(/^\/src\//, 'src/')}:{entry.line}</small>
        {entry.doc ? <p>{entry.doc}</p> : <p className={ref.missing}>No comment yet</p>}
        <code>{entry.signature}</code>
      </div>
    </li>
  )
}

function FileRow({ file, open }: { file: FileDoc; open?: boolean }) {
  return (
    <details className={ref.file} open={open}>
      <summary><strong>{nameOf(file.path)}</strong><span>{file.summary || 'No description'}</span><em>{file.entries.length} exports · {file.lines} lines</em></summary>
      <ul>{file.entries.map((entry) => <EntryRow key={entry.name + entry.line} entry={entry} path={file.path} />)}</ul>
    </details>
  )
}

/** The code reference: every source file with its description and commented exports, read from the repository when the tab opens. */
export function CodeReference() {
  const [files, setFiles] = useState<FileDoc[] | null>(null)
  const [done, setDone] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const paths = Object.keys(SOURCES).sort()
      const docs: FileDoc[] = []
      for (let at = 0; at < paths.length && alive; at += 40) {
        const chunk = paths.slice(at, at + 40)
        docs.push(...(await Promise.all(chunk.map(async (path) => indexFile(path, await SOURCES[path]!())))))
        if (alive) setDone(Math.min(at + 40, paths.length))
      }
      if (alive) setFiles(docs)
    })()
    return () => { alive = false }
  }, [])

  const stats = useMemo(() => {
    const entries = (files ?? []).flatMap((file) => file.entries)
    return { files: files?.length ?? 0, entries: entries.length, commented: entries.filter((entry) => entry.doc).length, lines: (files ?? []).reduce((sum, file) => sum + file.lines, 0) }
  }, [files])

  const groups = useMemo(() => {
    const map = new Map<string, FileDoc[]>()
    for (const file of files ?? []) map.set(dirOf(file.path), [...(map.get(dirOf(file.path)) ?? []), file])
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [files])

  const text = query.trim().toLowerCase()
  const hits = useMemo(() => {
    if (!text) return []
    const found: { entry: Entry; path: string }[] = []
    for (const file of files ?? []) for (const entry of file.entries) if (`${entry.name} ${entry.doc} ${file.path} ${file.summary}`.toLowerCase().includes(text)) found.push({ entry, path: file.path })
    return found
  }, [files, text])

  if (!files) return <p className={ref.stats}>Reading the source files… {done} of {Object.keys(SOURCES).length}</p>
  return (
    <div>
      <p className={ref.stats}>
        <b>{stats.files}</b> files · <b>{stats.lines.toLocaleString()}</b> lines · <b>{stats.entries}</b> exports, <b>{Math.round((stats.commented / Math.max(1, stats.entries)) * 100)}%</b> with a comment
      </p>
      <input className={ref.search} type="search" placeholder="Search names, comments and paths (e.g. propagate, commit, data-fe-list)…" aria-label="Search the code" value={query} onChange={(event) => setQuery(event.target.value)} />
      {text ? (
        <>
          <p className={ref.stats}>{hits.length} match{hits.length === 1 ? '' : 'es'}{hits.length > 150 ? ' (showing 150)' : ''}</p>
          <ul className={ref.results}>{hits.slice(0, 150).map(({ entry, path }) => <EntryRow key={path + entry.name + entry.line} entry={entry} path={path} />)}</ul>
        </>
      ) : groups.map(([dir, list]) => (
        <details key={dir} className={ref.folder}>
          <summary>{dir.replace(/^\/src/, 'src')} <em>{list.length} files</em></summary>
          {list.map((file) => <FileRow key={file.path} file={file} />)}
        </details>
      ))}
    </div>
  )
}

