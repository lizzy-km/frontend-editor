import { track } from '@/features/analytics/track'
import { Icon } from '@/shared/ui'
import { insertHtml } from '../actions/contentActions'
import { BLOCKS } from './blocks'
import { AddCodeBox } from './AddCodeBox'
import { Fold } from './Fold'
import { ReadyBlocks } from './ReadyBlocks'
import { ReuseBlocks } from './ReuseBlocks'
import { WidgetBlocks } from './WidgetBlocks'
import styles from './Sidebar.module.css'

/** Add a basic piece, or paste more code (e.g. "a pricing section" from an AI). */
export function AddPanel() {
  return (
    <div className={styles.add}>
      <p className={styles.addHint}>New things go inside the selected box, or after the selected element.</p>
      <Fold id="basic" title="Basics" count={BLOCKS.length} defaultOpen>
        {BLOCKS.map((block) => (
          <button key={block.id} type="button" className={styles.block} onClick={() => {
            insertHtml(block.html)
            track('add_block', { block: block.id })
          }}>
            <Icon name={block.icon} size={20} />
            <span>{block.label}</span>
          </button>
        ))}
      </Fold>
      <ReuseBlocks />
      <ReadyBlocks />
      <WidgetBlocks />
      <AddCodeBox />
    </div>
  )
}
