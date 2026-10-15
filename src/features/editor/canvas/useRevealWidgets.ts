import { useEffect } from 'react'
import { tellFrame } from '../frame/frame.store'
import { collectSubtreeIds, getAncestorIds, getElement } from '../model/tree/queries'
import type { NodeMap } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'

type Change = { id: string; name: string; value: string | null }

/** What to show for the selection: a tab's panel (and mark its tab), or the pop-over of a select list or date picker. */
export function revealChanges(nodes: NodeMap, selectedId: string): Change[] {
  const changes: Change[] = []
  for (const id of [selectedId, ...getAncestorIds(nodes, selectedId)]) {
    const node = getElement(nodes, id)
    if (!node) continue
    const key = node.attrs['data-ui-panel'] ?? node.attrs['data-ui-tab']
    if (key !== undefined) {
      const root = [id, ...getAncestorIds(nodes, id)].map((item) => getElement(nodes, item)).find((item) => item?.attrs['data-ui'] === 'tabs')
      for (const itemId of root ? collectSubtreeIds(nodes, root.id) : []) {
        const item = getElement(nodes, itemId)
        if (item?.attrs['data-ui-panel'] !== undefined) changes.push({ id: itemId, name: 'hidden', value: item.attrs['data-ui-panel'] === key ? null : '' })
        if (item?.attrs['data-ui-tab'] !== undefined) changes.push({ id: itemId, name: 'aria-selected', value: String(item.attrs['data-ui-tab'] === key) })
      }
    }
    if (node.attrs['data-ui'] === 'select' || node.attrs['data-ui'] === 'datepicker') {
      for (const itemId of collectSubtreeIds(nodes, id)) if (getElement(nodes, itemId)?.attrs['data-ui-popup'] !== undefined) changes.push({ id: itemId, name: 'hidden', value: null })
    }
  }
  return changes
}

/**
 * Closed things can't be clicked while editing (clicks go to the overlay), so selecting a tab, a panel, or a
 * select / date box opens it in the editor only. The saved page and the downloads keep their own state.
 */
export function useRevealWidgets() {
  const selectedId = useSelectionStore((state) => state.selectedId)
  useEffect(() => {
    if (!selectedId) return
    const changes = revealChanges(getDoc().nodes, selectedId)
    for (const change of changes) tellFrame('attr', change)
    return () => { for (const change of changes) tellFrame('unattr', { id: change.id, name: change.name }) }
  }, [selectedId])
}
