import styles from './Controls.module.css'
import type { ControlProps, Option } from './types'

type ChoiceProps = ControlProps & { options: Option[] }

/** Picks the option matching the value; computed values like "700" match "700". */
const matchOption = (options: Option[], value: string) => options.find((option) => option.value === value)?.value

/** Dropdown. Unknown current values show as "Custom". */
export function SelectControl({ value, onChange, label, options }: ChoiceProps) {
  const selected = matchOption(options, value)
  return (
    <select className={styles.select} aria-label={label} value={selected ?? '__custom'} onChange={(event) => onChange(event.target.value)}>
      {!selected && <option value="__custom" disabled>{value ? 'Custom' : 'Choose…'}</option>}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}

/** A row of 2–4 buttons, e.g. Left / Center / Right. */
export function SegmentedControl({ value, onChange, label, options }: ChoiceProps) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value} type="button" className={styles.segment}
          aria-pressed={option.value === value} onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
