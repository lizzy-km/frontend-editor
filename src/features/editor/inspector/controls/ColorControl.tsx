import styles from './Controls.module.css'
import { isTransparent, toHexColor } from './cssValues'
import type { ControlProps } from './types'
import { useDraft } from './useDraft'

/** Color swatch (opens the system picker) + a text box for exact values. */
export function ColorControl({ value, onChange, label }: ControlProps) {
  const empty = !value || isTransparent(value)
  // Opaque rgb() reads nicer as #hex; keep rgba()/named colors as they are.
  const shown = /^rgb\(/.test(value) ? toHexColor(value) : value
  const [draft, setDraft] = useDraft(shown)

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
        onBlur={() => draft !== shown && onChange(draft)}
        onKeyDown={(event) => event.key === 'Enter' && onChange(draft)}
      />
    </div>
  )
}
