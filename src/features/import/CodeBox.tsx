import { useId, useState, type DragEvent } from 'react'
import { toast } from '@/shared/ui'
import styles from './PasteScreen.module.css'
import { readCodeFile } from './readCodeFile'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  small?: boolean
  /** Allow dropping an .html file onto the box. */
  acceptFiles?: boolean
}

/** A big monospace text box; optionally accepts a dropped .html file. */
export function CodeBox({ label, value, onChange, placeholder, autoFocus, small, acceptFiles }: Props) {
  const id = useId()
  const [dragging, setDragging] = useState(false)

  const onDrop = async (event: DragEvent) => {
    if (!acceptFiles) return
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (!file) return
    try {
      onChange(await readCodeFile(file))
    } catch (error) {
      toast((error as Error).message, 'error')
    }
  }

  return (
    <div className={styles.box}>
      <label htmlFor={id} className={styles.boxLabel}>{label}</label>
      <textarea
        id={id} value={value} placeholder={placeholder} autoFocus={autoFocus} spellCheck={false}
        className={`${styles.code} ${small ? styles.small : ''} ${dragging ? styles.dragging : ''}`}
        onChange={(event) => onChange(event.target.value)}
        onDragOver={(event) => { if (acceptFiles) { event.preventDefault(); setDragging(true) } }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      />
    </div>
  )
}
