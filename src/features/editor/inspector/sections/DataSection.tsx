import { useMemo } from 'react'
import { Button } from '@/shared/ui'
import { connectFields, wireData } from '../../actions/dataWiring'
import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { LOAD_ATTR, PAGE_SIZE_ATTR, listInfo } from '../../model/dataLists'
import { ROW_ATTR, bindableParts, dataBoxOf, recordInfo, rowChoiceAttr, type RowChoice } from '../../model/dataRecords'
import { listPages } from '../../model/pages'
import type { DataSource, ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SegmentedControl, SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { SliderControl } from '../controls/SliderControl'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'
import { CardClick } from './CardClick'
import { FieldMap } from './FieldMap'

const EMPTY: DataSource[] = []
const ROWS = [{ value: 'first', label: 'The first one' }, { value: 'number', label: 'One by number' }, { value: 'param', label: 'The one in the link' }]

/** Which record a box shows. */
function RecordRow({ id, row }: { id: string; row: RowChoice }) {
  const set = (choice: RowChoice) => setAttribute(id, ROW_ATTR, rowChoiceAttr(choice))
  return (
    <>
      <div className={styles.row} title="Which item of your data this box shows">
        <span className={styles.label}>Which one</span>
        <SelectControl label="Which item" value={row.kind} options={ROWS}
          onChange={(kind) => set(kind === 'number' ? { kind: 'number', n: 1 } : kind === 'param' ? { kind: 'param', name: 'id' } : { kind: 'first' })} />
      </div>
      {row.kind === 'number' && (
        <div className={styles.row}>
          <span className={styles.label}>Item number</span>
          <SliderControl label="Item number" value={String(row.n)} min={1} max={50} unit="" onChange={(value) => set({ kind: 'number', n: Math.max(1, Math.round(Number(value))) })} />
        </div>
      )}
      {row.kind === 'param' && (
        <>
          <div className={styles.row} title="Which detail of each item the link carries. Almost always: id">
            <span className={styles.label}>Link uses</span>
            <TextControl label="Link uses" value={row.name} placeholder="id" onChange={(name) => set({ kind: 'param', name: name.trim() || 'id' })} />
          </div>
          <p className={styles.label}>The link a visitor follows decides which item shows: a link ending in 3 shows the item whose “{row.name}” is 3. Without a link, the first item shows.</p>
        </>
      )}
    </>
  )
}

/** Wire a box to data: a list (the design repeats for every row) or one record; then choose what each part shows. */
export function DataSection({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const sources = useDocStore((state) => state.doc.data ?? EMPTY)
  const rootId = useDocStore((state) => state.doc.rootId)
  const box = dataBoxOf(nodes, node.id)
  const source = sources.find((item) => item.name === box?.source)
  const list = listInfo(nodes, node.id)
  const record = recordInfo(nodes, node.id)
  const parts = useMemo(() => bindableParts(nodes, node.id).length, [nodes, node.id])
  const pages = useMemo(() => listPages({ nodes, rootId }), [nodes, rootId])

  return (
    <Section title="Data" icon="box" defaultOpen={Boolean(box)}>
      {sources.length === 0 ? (
        <p className={styles.label}>Add data in the Data tab first (products, posts, people…), then show it here.</p>
      ) : (
        <div className={styles.row}>
          <span className={styles.label}>Shows</span>
          <SelectControl label="Data to show" value={box?.source ?? ''} options={[{ value: '', label: 'No data' }, ...sources.map((item) => ({ value: item.name, label: item.name }))]}
            onChange={(name) => wireData(node.id, name ? (box?.mode ?? 'record') : null, name, record?.row)} />
        </div>
      )}
      {box && (
        <div className={styles.row}>
          <span className={styles.label}>Show</span>
          <SegmentedControl label="How the data shows" value={box.mode} options={[{ value: 'record', label: 'One item' }, { value: 'list', label: 'Every item' }]}
            onChange={(mode) => wireData(node.id, mode as 'list' | 'record', box.source, record?.row)} />
        </div>
      )}
      {list && (
        <>
          <div className={styles.row} title="How many cards appear at first (and each time more load)">
            <span className={styles.label}>Per page</span>
            <SliderControl label="Cards per page" value={String(list.pageSize)} min={1} max={48} unit=""
              onChange={(value) => setAttribute(node.id, PAGE_SIZE_ATTR, String(Math.max(1, Math.round(Number(value)))))} />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>More cards</span>
            <SegmentedControl label="How more cards arrive" value={list.load} options={[{ value: 'scroll', label: 'On scroll' }, { value: 'all', label: 'Show all' }]}
              onChange={(load) => setAttributes(node.id, { [LOAD_ATTR]: load })} />
          </div>
          {list.templateId && source && nodes[list.templateId]?.kind === 'element' && <CardClick design={nodes[list.templateId] as ElementNode} source={source} pages={pages} />}
          <p className={styles.label}>The first thing inside is the card design: change it to change every card.</p>
        </>
      )}
      {record && <RecordRow id={node.id} row={record.row} />}
      {box && source && (
        <>
          <p className={styles.label}>Show these from “{source.name}”:</p>
          <FieldMap nodes={nodes} boxId={node.id} source={source} pages={pages} />
          {parts > 0 && <Button size="small" icon="sparkle" onClick={() => connectFields(node.id, source.name)}>Fill in the fields for me</Button>}
          <p className={styles.label}>Preview and the downloaded page show the real values.</p>
        </>
      )}
    </Section>
  )
}
