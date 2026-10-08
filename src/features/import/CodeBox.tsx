import { useId } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import type { CodeLanguage } from '@/shared/code/CodeEditor'
import { toast } from '@/shared/ui'
import styles from './PasteScreen.module.css'
import { readCodeFile } from './readCodeFile'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  language?: CodeLanguage
  placeholder?: string
  autoFocus?: boolean
  small?: boolean
  /** Allow dropping an .html file onto the box. */
  acceptFiles?: boolean
}

/** A code box (CodeMirror: colours, line numbers, search); optionally accepts a dropped .html file. */
export function CodeBox({ label, value, onChange, language = 'html', placeholder, autoFocus, small, acceptFiles }: Props) {
  const id = useId()

  const onDropFile = (file: File) => {
    if (!acceptFiles) return false
    readCodeFile(file).then(onChange, (error: Error) => toast(error.message, 'error'))
    return true
  }

  return (
    <div className={styles.box}>
      <span id={id} className={styles.boxLabel}>{label}</span>
      <LazyCodeEditor
        label={label} language={language} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
        foldTools={false} minHeight={small ? '120px' : '260px'} maxHeight={small ? '320px' : '520px'} onDropFile={onDropFile}
      />
    </div>
  )
}
