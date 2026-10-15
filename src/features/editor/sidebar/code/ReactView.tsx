import { useMemo, useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button } from '@/shared/ui'
import { componentViews, focusedView } from '@/features/export/react/componentViews'
import { useDocStore } from '../../store/doc.store'
import { useSelectionStore } from '../../store/selection.store'
import styles from '../Sidebar.module.css'

/** The React (TSX) code of the component you are working on: the one around the selected element. */
export function ReactView() {
  const doc = useDocStore((state) => state.doc)
  const selectedId = useSelectionStore((state) => state.selectedId)
  const views = useMemo(() => componentViews(doc), [doc])
  const focused = useMemo(() => focusedView(views, doc.nodes, selectedId), [views, doc.nodes, selectedId])
  // A component picked by hand stays until something else is selected.
  const [picked, setPicked] = useState<{ forSelection: string | null; path: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const chosen = picked && picked.forSelection === selectedId ? views.find((view) => view.path === picked.path) : undefined
  const view = chosen ?? focused ?? views[0]

  const copy = async () => {
    if (!view) return
    await navigator.clipboard.writeText(view.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!view) return <p className={styles.addHint}>Nothing to show yet. Add something to the page.</p>
  return (
    <div className={styles.reactView}>
      <p className={styles.addHint}>
        This is the React code your download gets for {focused && !chosen ? <>what you selected</> : 'this component'}. Click something on the page to see its component.
      </p>
      <label className={styles.addLabel}>
        Component
        <select className={styles.reactSelect} aria-label="Component" value={view.path} onChange={(event) => setPicked({ forSelection: selectedId, path: event.target.value })}>
          {views.map((item) => <option key={item.path} value={item.path}>{item.name}  ·  {item.path.replace('src/', '')}</option>)}
        </select>
      </label>
      <LazyCodeEditor label="React component code" language="tsx" value={view.code} onChange={() => {}} readOnly foldTools={false} minHeight="220px" maxHeight="560px" />
      <div className={styles.reactActions}>
        <Button size="small" icon="copy" onClick={() => void copy()}>{copied ? 'Copied!' : 'Copy code'}</Button>
        <span className={styles.addHint}>{view.path}</span>
      </div>
    </div>
  )
}
