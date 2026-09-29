import styles from './Controls.module.css'
import { isTransparent, toHexColor } from './cssValues'
import type { ControlProps } from './types'
import { useDraft } from './useDraft'

/** Color swatch (opens the system picker) + a text box for exact values. */
export function ColorControl({ value, onChange, label }: ControlProps) {
  const [draft, setDraft] = useDraft(value)
  const empty = !value || isTransparent(value)

  return (
    <div className={styles.color}>
      <label className={styles.swatch} title="Pick a color">
        <span style={{ background: empty ? 'transparent' : value }} />
        <input
          type="color" aria-label={label} value={toHexColor(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <input
        className={styles.input} value={empty ? '' : draft} placeholder="None" aria-label={`${label} value`}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => draft !== value && onChange(draft)}
        onKeyDown={(event) => event.key === 'Enter' && onChange(draft)}
      />
    </div>
  )
}
