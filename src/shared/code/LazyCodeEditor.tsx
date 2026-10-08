import { lazy, Suspense } from 'react'
import type { CodeEditorProps } from './CodeEditor'
import styles from './CodeEditor.module.css'

const CodeEditor = lazy(() => import('./CodeEditor'))

/** Starts downloading the code editor early (e.g. when a screen with a code box opens). */
export const preloadCodeEditor = () => void import('./CodeEditor')

/**
 * The code editor, with a plain box in its place until it has downloaded.
 * Both show the same value, so nothing typed or pasted meanwhile is lost.
 */
export function LazyCodeEditor(props: CodeEditorProps) {
  const fallback = (
    <textarea
      className={styles.fallback} aria-label={props.label} value={props.value} placeholder={props.placeholder}
      spellCheck={false} autoFocus={props.autoFocus} style={{ minHeight: props.minHeight, maxHeight: props.maxHeight }}
      onChange={(event) => props.onChange(event.target.value)}
    />
  )
  return <Suspense fallback={fallback}><CodeEditor {...props} /></Suspense>
}
