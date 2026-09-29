import styles from './Controls.module.css'
import type { ControlProps } from './types'
import { useDraft } from './useDraft'

/** Free text. Saves on Enter or when leaving the box (not on every key). */
export function TextControl({ value, onChange, label, placeholder }: ControlProps & { placeholder?: string }) {
  const [draft, setDraft] = useDraft(value)
  const save = () => draft !== value && onChange(draft)

  return (
    <input
      className={styles.input} aria-label={label} value={draft} placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => event.key === 'Enter' && save()}
    />
  )
}
