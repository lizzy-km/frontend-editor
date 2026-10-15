import { useMemo, useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button } from '@/shared/ui'
import { componentViews, focusedView } from '@/features/export/react/componentViews'
import { editBlocker, extractMarkup } from '@/features/export/react/jsxEdit/applyJsx'
import { parseJsx } from '@/features/export/react/jsxEdit/jsxParse'
import { applyComponentMarkup } from '../../actions/componentActions'
import { useDocStore } from '../../store/doc.store'
import { useSelectionStore } from '../../store/selection.store'
import styles from '../Sidebar.module.css'

/** The line of the file where a problem in the markup is (the markup starts after `return (`). */
const fileLine = (code: string, markupLine: number) => code.slice(0, code.indexOf('\n  return (\n')).split('\n').length + 1 + markupLine

/**
 * The React (TSX) code of the component around the selected element. Plain markup
 * (words, tags, attributes, structure) can be edited and applied to the page;
 * components with code in them (lists, forms, menus) are shown read-only.
 */
export function ReactView() {
  const doc = useDocStore((state) => state.doc)
  const selectedId = useSelectionStore((state) => state.selectedId)
  const views = useMemo(() => componentViews(doc), [doc])
  const focused = useMemo(() => focusedView(views, doc.nodes, selectedId), [views, doc.nodes, selectedId])
  // A component picked by hand stays until something else is selected.
  const [picked, setPicked] = useState<{ forSelection: string | null; path: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const chosen = picked && picked.forSelection === selectedId ? views.find((item) => item.path === picked.path) : undefined
  const view = chosen ?? focused ?? views[0]

  // What is typed stays until the page's own code for this component changes (undo, another edit).
  const [draft, setDraft] = useState({ base: '', text: '' })
  const [problem, setProblem] = useState('')
  const base = view?.code ?? ''
  if (draft.base !== base) { setDraft({ base, text: base }); setProblem('') }

  const blocker = view ? editBlocker(view.code) : null
  const text = draft.text
  const edited = text !== base
  const live = useMemo(() => {
    const markup = extractMarkup(text)
    if (markup === null) return 'The code needs the `return (` … `)` part to stay.'
    const result = parseJsx(markup)
    return result.ok ? '' : `Line ${fileLine(text, result.line)}: ${result.error}`
  }, [text])

  const apply = () => {
    if (!view || live) return
    const result = applyComponentMarkup(view.ids[0]!, extractMarkup(text)!, views.map(({ name, ids }) => ({ name, ids })))
    setProblem(result.ok ? '' : `${result.error}`)
  }
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!view) return <p className={styles.addHint}>Nothing to show yet. Add something to the page.</p>
  return (
    <div className={styles.reactView}>
      <p className={styles.addHint}>
        {blocker === null
          ? 'This is the markup of the component. Change words, tags or attributes, then press Apply: the page follows.'
          : `Read-only: ${blocker} Change it in the editor.`}
      </p>
      <label className={styles.addLabel}>
        Component
        <select className={styles.reactSelect} aria-label="Component" value={view.path} onChange={(event) => setPicked({ forSelection: selectedId, path: event.target.value })}>
          {views.map((item) => <option key={item.path} value={item.path}>{item.name}  ·  {item.path.replace('src/', '')}</option>)}
        </select>
      </label>
      <LazyCodeEditor key={view.path} label="React component code" language="tsx" value={text} onChange={(next) => setDraft({ base, text: next })}
        readOnly={blocker !== null} foldTools={false} minHeight="220px" maxHeight="560px" />
      {blocker === null && edited && live && <p role="alert" className={styles.reactProblem}>{live}</p>}
      {problem && <p role="alert" className={styles.reactProblem}>{problem}</p>}
      <div className={styles.reactActions}>
        {blocker === null && (
          <>
            <Button size="small" variant="primary" disabled={!edited || Boolean(live)} onClick={apply}>Apply to page</Button>
            <Button size="small" variant="ghost" disabled={!edited} onClick={() => { setDraft({ base, text: base }); setProblem('') }}>Undo my changes</Button>
          </>
        )}
        <Button size="small" icon="copy" onClick={() => void copy()}>{copied ? 'Copied!' : 'Copy code'}</Button>
        <span className={styles.addHint}>{view.path}</span>
      </div>
    </div>
  )
}
