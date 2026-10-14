import { Icon, type IconName } from '@/shared/ui'
import { isMultiPage } from '../model/pages'
import { useDocStore } from '../store/doc.store'
import { useViewStore, type SidePanel } from '../store/view.store'
import { AddPanel } from './AddPanel'
import { CodePanel } from './CodePanel'
import { DataPanel } from './data/DataPanel'
import { LayersPanel } from './LayersPanel'
import { PagesPanel } from './pages/PagesPanel'
import styles from './Sidebar.module.css'

const TABS: { id: SidePanel; label: string; icon: IconName }[] = [
  { id: 'pages', label: 'Pages', icon: 'globe' },
  { id: 'layers', label: 'Layers', icon: 'layers' },
  { id: 'add', label: 'Add', icon: 'plus' },
  { id: 'data', label: 'Data', icon: 'box' },
  { id: 'code', label: 'Code', icon: 'code' },
]

/** Left column: Pages / Layers / Add / Data / Code. */
export function Sidebar() {
  const site = useDocStore((state) => isMultiPage(state.doc))
  const chosen = useViewStore((state) => state.sidePanel)
  const setPanel = useViewStore((state) => state.setSidePanel)
  // One-page projects have no Pages tab (it appears once the project becomes a website).
  const tabs = TABS.filter((tab) => tab.id !== 'pages' || site)
  const panel = chosen === 'pages' && !site ? 'layers' : chosen

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={panel === tab.id} className={styles.tab} onClick={() => setPanel(tab.id)}>
            <Icon name={tab.icon} size={15} /> {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={styles.panel}>
        {panel === 'pages' && <PagesPanel />}
        {panel === 'layers' && <LayersPanel />}
        {panel === 'add' && <AddPanel />}
        {panel === 'data' && <DataPanel />}
        {panel === 'code' && <CodePanel />}
      </div>
    </div>
  )
}
