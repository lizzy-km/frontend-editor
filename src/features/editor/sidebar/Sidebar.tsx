import { Icon, type IconName } from '@/shared/ui'
import { isMultiPage } from '../model/pages'
import { useDocStore } from '../store/doc.store'
import { useViewStore, type SidePanel } from '../store/view.store'
import { AddPanel } from './AddPanel'
import { CodePanel } from './CodePanel'
import { DataPanel } from './data/DataPanel'
import { DesignPanel } from './design/DesignPanel'
import { LayersPanel } from './LayersPanel'
import { PagesPanel } from './pages/PagesPanel'
import styles from './Sidebar.module.css'

const TABS: { id: SidePanel; label: string; icon: IconName; hint: string }[] = [
  { id: 'layers', label: 'Layers', icon: 'layers', hint: 'Everything on this page, in order' },
  { id: 'add', label: 'Add', icon: 'plus', hint: 'Add text, pictures, forms and ready-made blocks' },
  { id: 'pages', label: 'Pages', icon: 'globe', hint: 'The pages of your website' },
  { id: 'design', label: 'Design', icon: 'sun', hint: 'Colors and layout for the whole project' },
  { id: 'data', label: 'Data', icon: 'box', hint: 'Lists like products or posts, and the sign-in API' },
  { id: 'code', label: 'Code', icon: 'code', hint: 'The page’s HTML, styles and scripts' },
]

/** Left side: a slim rail of destinations (icon + name) and the open one. */
export function Sidebar() {
  const site = useDocStore((state) => isMultiPage(state.doc))
  const chosen = useViewStore((state) => state.sidePanel)
  const setPanel = useViewStore((state) => state.setSidePanel)
  // One-page projects have no Pages tab (it appears once the project becomes a website).
  const tabs = TABS.filter((tab) => tab.id !== 'pages' || site)
  const panel = chosen === 'pages' && !site ? 'layers' : chosen

  return (
    <div className={styles.sidebar}>
      <div className={styles.rail} role="tablist" aria-orientation="vertical" aria-label="Project">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={panel === tab.id} title={tab.hint} className={styles.tab} onClick={() => setPanel(tab.id)}>
            <Icon name={tab.icon} size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={TABS.find((tab) => tab.id === panel)?.label} className={styles.panel}>
        {panel === 'pages' && <PagesPanel />}
        {panel === 'layers' && <LayersPanel />}
        {panel === 'add' && <AddPanel />}
        {panel === 'design' && <DesignPanel />}
        {panel === 'data' && <DataPanel />}
        {panel === 'code' && <CodePanel />}
      </div>
    </div>
  )
}
