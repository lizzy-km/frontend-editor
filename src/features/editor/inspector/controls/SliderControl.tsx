import styles from './Controls.module.css'
import { roundNumber, splitUnit } from './cssValues'
import type { ControlProps } from './types'

type Props = ControlProps & { min: number; max: number; step?: number; unit: string }

/** Slider + number box. Writes e.g. "24px" (or a plain number when unit is ''). */
export function SliderControl({ value, onChange, label, min, max, step = 1, unit }: Props) {
  const parsed = splitUnit(value).number
  const number = parsed === null ? min : roundNumber(parsed)
  const write = (next: number) => onChange(`${next}${unit}`)

  return (
    <div className={styles.slider}>
      <input
        type="range" aria-label={label} min={min} max={Math.max(max, number)} step={step} value={number}
        onChange={(event) => write(Number(event.target.value))}
      />
      <input
        type="number" className={`${styles.input} ${styles.number}`} aria-label={`${label} value`}
        step={step} value={number}
        onChange={(event) => event.target.value !== '' && write(Number(event.target.value))}
      />
    </div>
  )
}
