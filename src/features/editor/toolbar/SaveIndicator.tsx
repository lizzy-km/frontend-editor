import { Icon, Spinner } from '@/shared/ui'
import { useSaveStore } from '../persistence/save.store'
import styles from './Toolbar.module.css'

/** "Saved in this browser" / "Saving…" / "Couldn't save". */
export function SaveIndicator() {
  const status = useSaveStore((state) => state.status)
  const where = useSaveStore((state) => state.where)

  const content = {
    idle: <><Icon name="check" size={15} /> All changes saved {where}</>,
    saved: <><Icon name="check" size={15} /> Saved {where}</>,
    unsaved: <>Unsaved changes…</>,
    saving: <><Spinner size={13} /> Saving…</>,
    error: <><Icon name="help" size={15} /> Couldn't save — check your connection</>,
  }[status]

  return (
    <span className={`${styles.saveStatus} ${status === 'error' ? styles.saveError : ''}`} role="status" aria-live="polite">
      {content}
    </span>
  )
}
