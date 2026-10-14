import { track } from '@/features/analytics/track'
import { Icon } from '@/shared/ui'
import { insertHtml } from '../actions/contentActions'
import { createSource } from '../actions/dataActions'
import { DATA_PRESETS } from '../model/dataPresets'
import { listBoxHtml } from '../model/dataLists'
import { getDoc } from '../store/doc.store'
import styles from './Sidebar.module.css'

/** A list of cards from the first data source (sample products are added when there is no data yet). */
function addDataList() {
  if (!getDoc().data?.length) createSource(DATA_PRESETS[0]!.source, 'Products (for a list)')
  const source = getDoc().data![0]!
  insertHtml(listBoxHtml(source))
  track('add_block', { block: 'data-list' })
}

const READY = [
  { id: 'data-list', label: 'List from data', hint: 'Cards filled from your data; loads more as visitors scroll', icon: 'layers' as const, add: addDataList },
]

/** Ready-made components that do more than show content. */
export function ReadyBlocks() {
  return (
    <>
      <p className={styles.addLabel}>Ready-made</p>
      <div className={styles.blocks}>
        {READY.map((block) => (
          <button key={block.id} type="button" className={styles.block} title={block.hint} onClick={block.add}>
            <Icon name={block.icon} size={20} />
            <span>{block.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
