import styles from './Controls.module.css'
import { roundNumber, splitUnit } from './cssValues'
import type { ControlProps } from './types'
import { useDraft } from './useDraft'

/** Units in plain words. "auto" = let the page decide. */
const UNITS = [
  { value: 'px', label: 'pixels' },
  { value: '%', label: '% of box' },
  { value: 'vw', label: '% screen' },
  { value: 'auto', label: 'automatic' },
]

/** Number + unit, for width/height/etc. */
export function SizeControl({ value, onChange, label }: ControlProps) {
  const parsed = splitUnit(value)
  const unit = parsed.number === null ? 'auto' : parsed.unit || 'px'
  const [draft, setDraft] = useDraft(parsed.number === null ? '' : String(roundNumber(parsed.number, 1)))

  const commit = (nextNumber: string, nextUnit: string) => {
    if (nextUnit === 'auto') onChange('auto')
    else if (nextNumber !== '') onChange(`${Number(nextNumber)}${nextUnit}`)
  }

  return (
    <div className={styles.size}>
      <input
        type="number" className={`${styles.input} ${styles.number}`} aria-label={label}
        value={draft} placeholder="auto" disabled={unit === 'auto'}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft, unit)}
        onKeyDown={(event) => event.key === 'Enter' && commit(draft, unit)}
      />
      <select
        className={`${styles.select} ${styles.unit}`} aria-label={`${label} unit`} value={UNITS.some((u) => u.value === unit) ? unit : 'px'}
        onChange={(event) => commit(draft || '100', event.target.value)}
      >
        {UNITS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
  )
}
