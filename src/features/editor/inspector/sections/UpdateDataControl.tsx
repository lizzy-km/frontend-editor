import { useMemo } from 'react'
import { setUpdateClick } from '../../actions/updateActions'
import { LIST_ATTR } from '../../model/dataLists'
import { getAncestorIds } from '../../model/tree/queries'
import type { ElementNode } from '../../model/types'
import { itemAddress, updatableSources, updateClickOf, type UpdateClick } from '../../model/updateClicks'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import panel from '../Inspector.module.css'
import { UpdateChanges } from './UpdateChanges'

/** "Update data": clicking changes an item in a connected API (the card the button is in, or one item by its id). */
export function UpdateDataControl({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const data = useDocStore((state) => state.doc.data)
  const sources = useMemo(() => updatableSources({ data }), [data])
  const click = updateClickOf(node.attrs)
  const source = sources.find((one) => one.name === click?.source)
  // The data list this button sits in (its card is "the clicked item").
  const cardSource = useMemo(() => getAncestorIds(nodes, node.id).map((id) => (nodes[id] as ElementNode | undefined)?.attrs?.[LIST_ATTR]).find(Boolean), [nodes, node.id])
  const save = (next: UpdateClick | null) => setUpdateClick(node.id, next)
  const choose = (name: string) => {
    const picked = sources.find((one) => one.name === name)
    if (!picked) return save(null)
    save({ source: name, item: cardSource === name ? 'clicked' : { id: '' }, changes: [{ field: picked.fields.find((field) => field.name !== 'id')?.name ?? picked.fields[0]?.name ?? '', op: 'set', value: '' }] })
  }
  return (
    <>
      <div className={styles.row} title="Clicking sends a change to your API for one item, for example liked = yes or stock minus 1.">
        <span className={styles.label}>Update data</span>
        <SelectControl label="Data to update" value={click?.source ?? ''} onChange={choose}
          options={[{ value: '', label: sources.length ? 'Nothing' : 'None: connect an API first' }, ...sources.map((one) => ({ value: one.name, label: one.name }))]} />
      </div>
      {!sources.length && <p className={panel.note}>To change data on click, connect a real API in the Data tab (Connect API). The click sends the change to that item’s address.</p>}
      {click && source && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>Which item</span>
            <SelectControl label="Which item to update" value={click.item === 'clicked' ? 'clicked' : 'id'} onChange={(kind) => save(kind === 'clicked' ? { ...click, item: 'clicked' } : { ...click, item: { id: '' }, changes: click.changes.map((change) => ({ ...change, op: 'set' as const })) })}
              options={[...(cardSource === click.source ? [{ value: 'clicked', label: 'The card this button is in' }] : []), { value: 'id', label: 'One item, by its id' }]} />
          </div>
          {click.item !== 'clicked' && (
            <div className={styles.row}><span className={styles.label}>Item id</span><TextControl label="Id of the item to update" value={click.item.id} placeholder="e.g. 7" onChange={(id) => save({ ...click, item: { id } })} /></div>
          )}
          <UpdateChanges source={source} changes={click.changes} rowKnown={click.item === 'clicked'} onChange={(changes) => save({ ...click, changes })} />
          <p className={panel.note}>A visitor’s click sends a PATCH request to {itemAddress(source.api)}. Lists then show the new value.</p>
        </>
      )}
    </>
  )
}
