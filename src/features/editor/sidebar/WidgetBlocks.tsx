import { Icon } from '@/shared/ui'
import { insertWidget } from '../actions/widgetActions'
import { WIDGET_GROUPS } from '../model/widgets/registry'
import styles from './Sidebar.module.css'

/** Add → inputs, tabs, tables, search and filters: ready-made parts that already work in Preview and downloads. */
export function WidgetBlocks() {
  return (
    <>
      {WIDGET_GROUPS.map((group) => (
        <div key={group.id}>
          <p className={styles.addLabel}>{group.label}</p>
          <div className={styles.blocks}>
            {group.blocks.map((block) => (
              <button key={block.id} type="button" className={styles.block} title={block.hint} onClick={() => insertWidget(block)}>
                <Icon name={block.icon} size={20} />
                <span>{block.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
