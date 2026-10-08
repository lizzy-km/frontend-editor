import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { unfoldAll } from '@codemirror/language'
import { EditorView, placeholder as placeholderText } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'
import { Button } from '@/shared/ui'
import { appCodeTheme } from './codeTheme'
import { foldSections } from './foldSections'
import styles from './CodeEditor.module.css'

export type CodeLanguage = 'css' | 'js' | 'html'

export type CodeEditorProps = {
  value: string
  language: CodeLanguage
  /** Read aloud and used to find the box (aria-label). */
  label: string
  /** Called with the full text after each change (the caller debounces if needed). */
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  /** Fold all / Unfold all buttons above the box (page code). Default: on. */
  foldTools?: boolean
  /** Height limits, e.g. "260px" / "520px". The box grows with its text in between. */
  minHeight?: string
  maxHeight?: string
  /** A dropped file: return true when it was handled (e.g. an .html file read into the box). */
  onDropFile?: (file: File) => boolean
}

const LANGUAGES = { css: () => css(), js: () => javascript(), html: () => html() }

/**
 * A real code editor (CodeMirror 6): colours, line numbers, brackets,
 * search (Ctrl/⌘+F), folding and its own undo. Used for every code box in
 * the app; loaded lazily (it is big).
 */
export default function CodeEditor(props: CodeEditorProps) {
  const { value, language, label, placeholder, autoFocus, foldTools = true, minHeight, maxHeight } = props
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const latest = useRef(props)
  useEffect(() => { latest.current = props })

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
        EditorView.theme({ '.cm-scroller': { minHeight: minHeight ?? 'auto', maxHeight: maxHeight ?? 'none' } }),
        EditorView.contentAttributes.of({ 'aria-label': label }),
        ...(placeholder ? [placeholderText(placeholder)] : []),
        EditorView.domEventHandlers({
          drop: (event) => {
            const file = event.dataTransfer?.files[0]
            if (!file || !latest.current.onDropFile?.(file)) return false
            event.preventDefault()
            return true
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) latest.current.onChange(update.state.doc.toString())
        }),
      ],
    })
    view.current = editor
    if (autoFocus) editor.focus()
    return () => {
      editor.destroy()
      view.current = null
    }
    // Created once per language/label; later value changes are synced by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, label])

  // The text changed elsewhere (undo, a dropped file, another panel): show it.
  useEffect(() => {
    const editor = view.current
    if (!editor || editor.state.doc.toString() === value) return
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } })
  }, [value])

  const run = (command: typeof unfoldAll) => {
    if (view.current) command(view.current)
    view.current?.focus()
  }

  return (
    <div className={styles.wrap}>
      {foldTools && (
        <div className={styles.tools} role="toolbar" aria-label={`${label} tools`}>
          <Button size="small" variant="ghost" icon="chevronRight" title="Collapse every block — the page frame stays open" onClick={() => run(foldSections)}>Fold all</Button>
          <Button size="small" variant="ghost" icon="chevronDown" title="Expand every block (Ctrl+Alt+])" onClick={() => run(unfoldAll)}>Unfold all</Button>
        </div>
      )}
      <div ref={host} />
    </div>
  )
}
