import { Icon } from '@/shared/ui'
import { addInstance } from '../actions/reuseActions'
import { COMPONENT_ATTR, instancesOf, mainsOf } from '../model/reuse/attrs'
import { useDocStore } from '../store/doc.store'
import { Fold } from './Fold'
import styles from './Sidebar.module.css'

/** Add → Your components: every main component of the page; a click puts a copy on the page. */
export function ReuseBlocks() {
  const nodes = useDocStore((state) => state.doc.nodes)
  const mains = mainsOf(nodes)
  if (!mains.length) return null
  return (
    <Fold id="components" title="Your components" count={mains.length} defaultOpen>
      {mains.map((main) => (
        <button key={main.id} type="button" className={styles.block} title={`${instancesOf(nodes, main.id).length} copies on the page`} onClick={() => addInstance(main.id)}>
          <Icon name="layers" size={20} />
          <span>{main.attrs[COMPONENT_ATTR]}</span>
        </button>
      ))}
    </Fold>
  )
}
