import { useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import styles from './Sidebar.module.css'

export type Parts = { html: string; css: string; js: string }
export const EMPTY_PARTS: Parts = { html: '', css: '', js: '' }
export const hasCode = (parts: Parts) => Object.values(parts).some((text) => text.trim())

type Part = keyof Parts
const PARTS: { id: Part; label: string; language: 'html' | 'css' | 'js'; hint: string }[] = [
  { id: 'html', label: 'HTML', language: 'html', hint: 'e.g. a section your AI wrote, or a whole page…' },
  { id: 'css', label: 'CSS', language: 'css', hint: 'Styles for it (optional)…' },
  { id: 'js', label: 'JavaScript', language: 'js', hint: 'Its script (optional)…' },
]

/** Three code boxes (HTML, CSS, JavaScript) behind tabs; a dot on a tab shows it has code. Any of them can stay empty. */
export function CodePartsBox({ value, onChange }: { value: Parts; onChange: (next: Parts) => void }) {
  const [part, setPart] = useState<Part>('html')
  const current = PARTS.find((item) => item.id === part)!
  return (
    <>
      <div className={styles.codeTabs} role="tablist" aria-label="Kind of code">
        {PARTS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={part === item.id} className={styles.codeTab} onClick={() => setPart(item.id)}>
            {item.label}{value[item.id].trim() ? ' •' : ''}
          </button>
        ))}
      </div>
      <LazyCodeEditor key={part} label={`Paste ${current.label}`} language={current.language} value={value[part]} onChange={(text) => onChange({ ...value, [part]: text })}
        placeholder={current.hint} foldTools={false} minHeight="110px" maxHeight="260px" />
    </>
  )
}
