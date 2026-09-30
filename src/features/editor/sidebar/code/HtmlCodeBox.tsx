import { lazy, Suspense, useMemo, useState } from 'react'
import { Button, toast } from '@/shared/ui'
import { applyHtml, editableHtml, hasScreenSizeEdits } from '../../actions/codeActions'
import { looksLikeHtml, stripCodeFences } from '../../model/parse/cleanPaste'
import { useDocStore } from '../../store/doc.store'
import styles from '../Sidebar.module.css'

const CodeEditor = lazy(() => import('./CodeEditor'))

type Props = {
  /** Element to edit; the page's root id means "the whole page". */
  targetId: string
  label: string
  /** Called after a successful Apply (e.g. to close a dialog). */
  onApplied?: () => void
  tall?: boolean
  /** Hide the label when a section header already shows it. */
  hideLabel?: boolean
}

/**
 * HTML of a part (or the whole page) in a code editor, applied on demand —
 * re-building the page on every key press would lose the selection and undo.
 */
export function HtmlCodeBox({ targetId, label, onApplied, tall, hideLabel }: Props) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const current = useMemo(() => (nodes ? editableHtml(targetId) : ''), [nodes, targetId])
  const [draft, setDraft] = useState<{ base: string; text: string }>({ base: current, text: current })
  // The page changed elsewhere (undo, a click edit) and nothing is typed here: follow it.
  if (draft.base !== current && draft.text === draft.base) setDraft({ base: current, text: current })
  const changed = draft.text !== current
  const losesScreenEdits = useMemo(() => (nodes ? hasScreenSizeEdits(targetId) : false), [nodes, targetId])

  const apply = () => {
    const code = stripCodeFences(draft.text) // people paste AI answers here too
    if (code.trim() && !looksLikeHtml(code)) return toast("That doesn't look like HTML code.", 'error')
    applyHtml(targetId, code)
    toast('Code applied — Ctrl+Z to undo', 'success')
    onApplied?.()
  }

  return (
    <div className={styles.codeLabel}>
      {!hideLabel && <span>{label}</span>}
      <Suspense fallback={<div className={styles.codeLoading}>Loading the code editor…</div>}>
        <div className={tall ? styles.codeTall : undefined}>
          <CodeEditor label={label} language="html" value={draft.text} onChange={(text) => setDraft((old) => ({ ...old, text }))} />
        </div>
      </Suspense>
      {changed && losesScreenEdits && (
        <p className={styles.codeWarning}>Tablet and phone-only changes inside this part will be removed when you apply.</p>
      )}
      <div className={styles.codeActions}>
        <Button size="small" variant="primary" icon="check" disabled={!changed} onClick={apply}>Apply changes</Button>
        <Button size="small" variant="ghost" disabled={!changed} onClick={() => setDraft({ base: current, text: current })}>Discard</Button>
      </div>
    </div>
  )
}
