import { Icon, type IconName } from '@/shared/ui'
import { useViewStore, type SidePanel } from '../store/view.store'
import { AddPanel } from './AddPanel'
import { CodePanel } from './CodePanel'
import { LayersPanel } from './LayersPanel'
import styles from './Sidebar.module.css'

const TABS: { id: SidePanel; label: string; icon: IconName }[] = [
  { id: 'layers', label: 'Layers', icon: 'layers' },
  { id: 'add', label: 'Add', icon: 'plus' },
  { id: 'code', label: 'Code', icon: 'code' },
]

/** Left column: Layers / Add / Code. */
export function Sidebar() {
  const panel = useViewStore((state) => state.sidePanel)
  const setPanel = useViewStore((state) => state.setSidePanel)

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={panel === tab.id} className={styles.tab} onClick={() => setPanel(tab.id)}>
            <Icon name={tab.icon} size={15} /> {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={styles.panel}>
        {panel === 'layers' && <LayersPanel />}
        {panel === 'add' && <AddPanel />}
        {panel === 'code' && <CodePanel />}
      </div>
    </div>
  )
}
