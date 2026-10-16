import { useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import { leaveComponent } from '../actions/reuseActions'
import { COMPONENT_ATTR, instancesOf } from '../model/reuse/attrs'
import { useDocStore } from '../store/doc.store'
import { useViewStore } from '../store/view.store'
import styles from './FocusBar.module.css'

/** The strip shown while a component is edited on its own: its name, how many copies follow, and Done. */
export function FocusBar() {
  const focusId = useViewStore((state) => state.focusId)
  const main = useDocStore((state) => (focusId ? state.doc.nodes[focusId] : undefined))
  const copies = useDocStore((state) => (focusId ? instancesOf(state.doc.nodes, focusId).length : 0))
  const alive = main?.kind === 'element' && COMPONENT_ATTR in main.attrs
  // The component was deleted or turned back into a normal box while it was being edited.
  useEffect(() => { if (focusId && !alive) useViewStore.getState().setFocus(null) }, [focusId, alive])
  if (!focusId || !alive) return null
  return (
    <div className={styles.bar} role="status" aria-label="Editing a component">
      <Icon name="component" size={18} />
      <span>Editing the component <strong>{main.attrs[COMPONENT_ATTR]}</strong> on its own. {copies === 0 ? 'It has no copies yet.' : `${copies} ${copies === 1 ? 'copy follows' : 'copies follow'} your changes.`}</span>
      <Button size="small" variant="primary" icon="check" onClick={leaveComponent}>Done</Button>
    </div>
  )
}
