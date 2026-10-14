import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { LIST_ATTR, LOAD_ATTR, PAGE_SIZE_ATTR, type ListInfo } from '../../model/dataLists'
import type { DataSource } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SegmentedControl, SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { SliderControl } from '../controls/SliderControl'
import { Section } from '../Section'

const EMPTY: DataSource[] = []

/** The "List from data" box: which data it shows, how many at a time, and how more arrive. */
export function DataListSection({ info }: { info: ListInfo }) {
  const sources = useDocStore((state) => state.doc.data ?? EMPTY)
  return (
    <Section title="List from data" icon="layers">
      <div className={styles.row}>
        <span className={styles.label}>Shows</span>
        <SelectControl label="Data to show" value={info.source} options={sources.map((source) => ({ value: source.name, label: source.name }))}
          onChange={(name) => setAttribute(info.id, LIST_ATTR, name)} />
      </div>
      <div className={styles.row} title="How many cards appear at first (and each time more load)">
        <span className={styles.label}>Per page</span>
        <SliderControl label="Cards per page" value={String(info.pageSize)} min={1} max={48} unit=""
          onChange={(value) => setAttribute(info.id, PAGE_SIZE_ATTR, String(Math.max(1, Math.round(Number(value)))))} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>More cards</span>
        <SegmentedControl label="How more cards arrive" value={info.load}
          options={[{ value: 'scroll', label: 'On scroll' }, { value: 'all', label: 'Show all' }]}
          onChange={(load) => setAttributes(info.id, { [LOAD_ATTR]: load })} />
      </div>
      <p className={styles.label}>Change the first card to change them all. The others show your data.</p>
    </Section>
  )
}
