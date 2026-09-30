import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { foldAll, unfoldAll } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'
import { Button } from '@/shared/ui'
import { appCodeTheme } from './codeTheme'
import styles from './CodeEditor.module.css'

export type CodeLanguage = 'css' | 'js' | 'html'

type Props = {
  value: string
  language: CodeLanguage
  label: string
  /** Called with the full text after each change (the caller debounces). */
  onChange: (value: string) => void
}

const LANGUAGES = { css: () => css(), js: () => javascript(), html: () => html() }

/**
 * A real code editor (CodeMirror 6): colours, line numbers, brackets,
 * search (Ctrl/⌘+F), folding (arrows in the gutter, or Fold all / Unfold all)
 * and its own undo. Loaded only when the Code tab opens.
 */
export default function CodeEditor({ value, language, label, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    if (!host.current) return
    const editor = new EditorView({
      parent: host.current,
      doc: value,
      extensions: [
        basicSetup,
        LANGUAGES[language](),
        EditorView.lineWrapping,
        appCodeTheme,
        EditorView.contentAttributes.of({ 'aria-label': label }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString())
        }),
      ],
    })
    view.current = editor
    return () => {
      editor.destroy()
      view.current = null
    }
    // Created once; later value changes are synced by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, label])

  // The page changed elsewhere (undo, another panel): show the new text.
  useEffect(() => {
    const editor = view.current
    if (!editor || editor.state.doc.toString() === value) return
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
  }, [value])

  const run = (command: typeof foldAll) => {
    if (view.current) command(view.current)
    view.current?.focus()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tools} role="toolbar" aria-label={`${label} tools`}>
        <Button size="small" variant="ghost" icon="chevronRight" title="Collapse every block (Ctrl+Alt+[)" onClick={() => run(foldAll)}>Fold all</Button>
        <Button size="small" variant="ghost" icon="chevronDown" title="Expand every block (Ctrl+Alt+])" onClick={() => run(unfoldAll)}>Unfold all</Button>
      </div>
      <div ref={host} />
    </div>
  )
}
