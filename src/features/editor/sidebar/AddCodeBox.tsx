import { useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button, toast } from '@/shared/ui'
import { addCodeToPage } from '../actions/addCodeActions'
import styles from './Sidebar.module.css'

type Part = 'html' | 'css' | 'js'
const PARTS: { id: Part; label: string; language: 'html' | 'css' | 'js'; hint: string }[] = [
  { id: 'html', label: 'HTML', language: 'html', hint: 'e.g. a section your AI wrote, or a whole page…' },
  { id: 'css', label: 'CSS', language: 'css', hint: 'Styles for it (optional)…' },
  { id: 'js', label: 'JavaScript', language: 'js', hint: 'Its script (optional)…' },
]

/** Paste more code: HTML, CSS and JavaScript in one place. Any of the three can be left empty. */
export function AddCodeBox() {
  const [code, setCode] = useState<Record<Part, string>>({ html: '', css: '', js: '' })
  const [part, setPart] = useState<Part>('html')
  const current = PARTS.find((item) => item.id === part)!

  const add = () => {
    const result = addCodeToPage(code)
    if (!result.ok) return toast(result.problem, 'error')
    setCode({ html: '', css: '', js: '' })
    toast(`Added to your page${result.found.length ? `: ${result.found.join(', ')}` : ''}`, 'success')
  }

  return (
    <>
      <span className={styles.addLabel}>Paste more code</span>
      <div className={styles.codeTabs} role="tablist" aria-label="Kind of code to add">
        {PARTS.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={part === item.id} className={styles.codeTab} onClick={() => setPart(item.id)}>
            {item.label}{code[item.id].trim() ? ' •' : ''}
          </button>
        ))}
      </div>
      <LazyCodeEditor key={part} label={`Paste ${current.label}`} language={current.language} value={code[part]} onChange={(value) => setCode((all) => ({ ...all, [part]: value }))}
        placeholder={current.hint} foldTools={false} minHeight="110px" maxHeight="260px" />
      <Button size="small" icon="plus" disabled={!Object.values(code).some((text) => text.trim())} onClick={add}>Add this code</Button>
    </>
  )
}
