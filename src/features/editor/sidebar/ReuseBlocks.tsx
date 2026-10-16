import { Icon } from '@/shared/ui'
import { addInstance } from '../actions/reuseActions'
import { COMPONENT_ATTR, looksOf } from '../model/reuse/attrs'
import { defaultLooks } from '../model/reuse/looks'
import { useDocStore } from '../store/doc.store'
import { Fold } from './Fold'
import styles from './Sidebar.module.css'

/** Add → Your components: every main component of the page; a click puts a copy on the page. */
export function ReuseBlocks() {
  const nodes = useDocStore((state) => state.doc.nodes)
  const mains = defaultLooks(nodes)
  if (!mains.length) return null
  return (
    <Fold id="components" title="Your components" count={mains.length} defaultOpen>
      {mains.map((main) => (
        <button key={main.id} type="button" className={styles.block} title={looksOf(nodes, main).length > 1 ? `${looksOf(nodes, main).length} looks; the first one is added` : 'Add a copy'} onClick={() => addInstance(main.id)}>
          <Icon name="layers" size={20} />
          <span>{main.attrs[COMPONENT_ATTR]}</span>
        </button>
      ))}
    </Fold>
  )
}
