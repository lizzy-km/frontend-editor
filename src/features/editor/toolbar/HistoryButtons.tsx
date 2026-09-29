import { Button } from '@/shared/ui'
import { useDocStore } from '../store/doc.store'
import styles from './Toolbar.module.css'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const mod = isMac ? '⌘' : 'Ctrl'

export function HistoryButtons() {
  const canUndo = useDocStore((state) => state.past.length > 0)
  const canRedo = useDocStore((state) => state.future.length > 0)
  const undo = useDocStore((state) => state.undo)
  const redo = useDocStore((state) => state.redo)

  return (
    <div className={styles.group}>
      <Button variant="ghost" size="small" icon="undo" aria-label="Undo" title={`Undo (${mod}+Z)`} disabled={!canUndo} onClick={undo} />
      <Button variant="ghost" size="small" icon="redo" aria-label="Redo" title={`Redo (${mod}+Shift+Z)`} disabled={!canRedo} onClick={redo} />
    </div>
  )
}
