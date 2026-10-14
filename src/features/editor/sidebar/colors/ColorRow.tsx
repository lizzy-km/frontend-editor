import { useRef } from 'react'
import { useDraft } from '../../inspector/controls/useDraft'
import styles from './Colors.module.css'

type Props = {
  /** The color now, as #rrggbb. */
  value: string
  /** What it is called ("--primary", "#C2410C"), and how often it is used. */
  title: string
  detail: string
  /** Called while dragging the picker (live) with the color the row had when the drag began, and when a hex is typed. */
  onChange: (hex: string, dragKey: string) => void
}

/** One color: a swatch that opens the picker, and its #hex to type. The page follows while you drag. */
export function ColorRow({ value, title, detail, onChange }: Props) {
  const [draft, setDraft] = useDraft(value)
  const start = useRef<string | null>(null)

  const live = (hex: string) => {
    start.current ??= value
    setDraft(hex)
    onChange(hex, start.current)
  }
  const typed = () => {
    const text = draft.trim()
    const hex = text.startsWith('#') ? text : `#${text}`
    if (/^#[0-9a-f]{6}$/i.test(hex) && hex.toLowerCase() !== value) onChange(hex.toLowerCase(), value)
    else setDraft(value)
  }

  return (
    <div className={styles.row}>
      <label className={styles.swatch} title="Pick a color" style={{ background: value }}>
        <input type="color" aria-label={`${title} color`} value={value} onChange={(event) => live(event.target.value)} onBlur={() => { start.current = null }} />
      </label>
      <div className={styles.text}>
        <span className={styles.name}>{title}</span>
        <span className={styles.detail}>{detail}</span>
      </div>
      <input
        className={styles.hex} aria-label={`${title} hex`} value={draft.toUpperCase()} maxLength={7} spellCheck={false}
        onChange={(event) => setDraft(event.target.value)} onBlur={typed} onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
      />
    </div>
  )
}
