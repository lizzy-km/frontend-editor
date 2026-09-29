import { updateDoc } from '../actions/commit'
import { useDraft } from '../inspector/controls/useDraft'
import { useDocStore } from '../store/doc.store'
import styles from './Sidebar.module.css'

function CodeArea({ label, value, onSave }: { label: string; value: string; onSave: (value: string) => void }) {
  const [draft, setDraft] = useDraft(value)
  return (
    <label className={styles.codeLabel}>
      {label}
      <textarea className={styles.codeArea} spellCheck={false} value={draft}
        onChange={(event) => setDraft(event.target.value)} onBlur={() => draft !== value && onSave(draft)} />
    </label>
  )
}

/** For the curious: the page's own CSS and scripts. Saved when you click away. */
export function CodePanel() {
  const css = useDocStore((state) => state.doc.css)
  const scripts = useDocStore((state) => state.doc.scripts)
  const inline = scripts.map((script, index) => ({ script, index })).filter(({ script }) => !script.src)

  return (
    <div className={styles.code}>
      <p className={styles.addHint}>Changes here apply when you click outside the box. Your clicks-and-sliders edits are kept separately and still win.</p>
      <CodeArea label="Styles (CSS)" value={css} onSave={(value) => updateDoc((doc) => ({ ...doc, css: value }))} />
      {inline.map(({ script, index }) => (
        <CodeArea
          key={index} label={`Script ${index + 1}${script.type === 'module' ? ' (module)' : ''} — runs in Preview`}
          value={script.code ?? ''}
          onSave={(value) => updateDoc((doc) => ({
            ...doc,
            scripts: doc.scripts.map((item, itemIndex) => (itemIndex === index ? { ...item, code: value } : item)),
          }))}
        />
      ))}
    </div>
  )
}
