import { lazy, Suspense, useMemo } from 'react'
import { debounce } from '@/lib/debounce'
import { updateDoc } from '../actions/commit'
import { useDocStore } from '../store/doc.store'
import { HtmlCodeBox } from './code/HtmlCodeBox'
import styles from './Sidebar.module.css'

// CodeMirror downloads only when someone opens the Code tab.
const CodeEditor = lazy(() => import('./code/CodeEditor'))

/** Wait this long after the last key before applying (keeps typing smooth). */
const APPLY_DELAY_MS = 400

/** What a code box edits: the page CSS, or the inline script at this index. */
type Target = 'css' | number

/** Writes the text back into the page. One undo step per typing burst (coalesce key). */
function applyTo(target: Target, value: string) {
  if (target === 'css') return updateDoc((doc) => ({ ...doc, css: value }), 'code:css')
  updateDoc((doc) => ({
    ...doc,
    scripts: doc.scripts.map((item, index) => (index === target ? { ...item, code: value } : item)),
  }), `code:script:${target}`)
}

function CodeArea({ label, target, value }: { label: string; target: Target; value: string }) {
  // Pending changes still apply if the tab is closed mid-typing.
  const applyLater = useMemo(() => debounce((text: string) => applyTo(target, text), APPLY_DELAY_MS), [target])
  return (
    <div className={styles.codeLabel}>
      <span>{label}</span>
      <Suspense fallback={<div className={styles.codeLoading}>Loading the code editor…</div>}>
        <CodeEditor label={label} language={target === 'css' ? 'css' : 'js'} value={value} onChange={applyLater} />
      </Suspense>
    </div>
  )
}

/** For the curious: the page's own CSS and scripts, in a real code editor. */
export function CodePanel() {
  const rootId = useDocStore((state) => state.doc.rootId)
  const css = useDocStore((state) => state.doc.css)
  const scripts = useDocStore((state) => state.doc.scripts)

  return (
    <div className={styles.code}>
      <p className={styles.addHint}>Change the page's code directly. Page HTML applies when you press Apply; styles show as you type; scripts run in Preview.</p>
      <HtmlCodeBox targetId={rootId} label="Page HTML" />
      <CodeArea label="Styles (CSS)" target="css" value={css} />
      {scripts.map((script, index) => !script.src && (
        <CodeArea
          key={index} target={index} value={script.code ?? ''}
          label={`Script ${index + 1}${script.type === 'module' ? ' (module)' : ''} — runs in Preview`}
        />
      ))}
    </div>
  )
}
