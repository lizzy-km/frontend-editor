import styles from './Switch.module.css'

type Props = { checked: boolean; onChange: (checked: boolean) => void; label: string }

export function Switch({ checked, onChange, label }: Props) {
  return (
    <label className={styles.row}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={styles.track} aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}
