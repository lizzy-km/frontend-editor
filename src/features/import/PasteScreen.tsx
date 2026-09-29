import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import type { PageDoc } from '@/features/editor/model/types'
import { Button, Icon } from '@/shared/ui'
import { analyzePaste } from './analyzePaste'
import { CodeBox } from './CodeBox'
import styles from './PasteScreen.module.css'

type Props = {
  onOpen: (doc: PageDoc) => void
  /** Extra actions under the box (e.g. "Try an example"). */
  secondary?: ReactNode
  heading?: string
}

/** The front door: paste code from an AI (or anywhere) and open it in the editor. */
export function PasteScreen({ onOpen, secondary, heading = 'Paste your code' }: Props) {
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')
  const [split, setSplit] = useState(false)
  // Parsing a big page on every key press would lag typing; defer it.
  const deferredHtml = useDeferredValue(html)
  const deferredCss = useDeferredValue(split ? css : '')
  const deferredJs = useDeferredValue(split ? js : '')
  const summary = useMemo(
    () => analyzePaste({ html: deferredHtml, css: deferredCss, js: deferredJs }),
    [deferredHtml, deferredCss, deferredJs],
  )

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <h1>{heading}</h1>
        <p className={styles.lead}>
          Copy the whole answer from ChatGPT, Claude, Gemini… and paste it below. We'll pick out the code for you.
        </p>

        <CodeBox label={split ? 'HTML' : 'Your code'} value={html} onChange={setHtml} autoFocus acceptFiles
          placeholder={'Paste here (Ctrl+V)…\n\nor drop an .html file'} />

        {split && (
          <div className={styles.split}>
            <CodeBox label="CSS (styles)" value={css} onChange={setCss} placeholder="Optional" small />
            <CodeBox label="JavaScript" value={js} onChange={setJs} placeholder="Optional" small />
          </div>
        )}

        <button type="button" className={styles.link} onClick={() => setSplit(!split)}>
          {split ? 'I have everything in one piece' : 'My code comes in separate parts (HTML, CSS, JavaScript)'}
        </button>

        {summary.problem && <p className={styles.problem} role="alert"><Icon name="help" size={16} /> {summary.problem}</p>}
        {summary.ok && (
          <p className={styles.found}><Icon name="check" size={16} /> Found: {summary.found.join(' · ')}</p>
        )}

        <div className={styles.actions}>
          <Button variant="primary" size="large" icon="sparkle" disabled={!summary.ok} onClick={() => summary.doc && onOpen(summary.doc)}>
            Open in editor
          </Button>
          {secondary}
        </div>
      </div>
    </div>
  )
}
