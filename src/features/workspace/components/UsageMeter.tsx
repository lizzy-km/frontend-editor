import styles from './Workspace.module.css'

/** "3 of 10 pages used" with a bar. Turns orange near the limit. */
export function UsageMeter({ used, max }: { used: number; max: number }) {
  const ratio = Math.min(1, used / max)
  return (
    <div className={styles.usage} title="Each saved page uses one slot">
      <span><strong>{used}</strong> of {max} pages used</span>
      <span className={styles.usageBar} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={used} aria-label="Pages used">
        <span style={{ width: `${ratio * 100}%` }} className={ratio >= 0.8 ? styles.usageFull : undefined} />
      </span>
    </div>
  )
}
