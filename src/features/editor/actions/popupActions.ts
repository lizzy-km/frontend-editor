import { track } from '@/features/analytics/track'
import { ASK_ATTR, CLOSE_ATTR, MODAL_ATTR, OPEN_ATTR, uniquePopupName } from '../model/popups'
import { RECORD_ATTR, ROW_ATTR } from '../model/dataRecords'
import { CALL_ATTR } from '../model/dataLists'
import { GO_ATTR } from '../model/pages'
import { patchNode } from '../model/tree/treeOps'
import { isElement, type ElementNode } from '../model/types'
import { getDoc } from '../store/doc.store'
import { updateNodes } from './commit'
import { setAttribute, setAttributes } from './nodeActions'

/** What clicking an element does with pop-ups: opens one, closes the one it is in, asks first. Each is one undo step. */
export function setOpens(id: string, name: string) {
  setAttribute(id, OPEN_ATTR, name)
  if (name) track('popup_set', { kind: 'open' })
}

export const setCloses = (id: string, on: boolean) => setAttributes(id, { [CLOSE_ATTR]: on ? 'true' : '' })

export function setAsk(id: string, message: string) {
  setAttribute(id, ASK_ATTR, message)
  if (message) track('popup_set', { kind: 'ask' })
}

/** Renames a pop-up and every opener that pointed at it, as ONE undo step. */
export function renamePopup(id: string, wanted: string) {
  const nodes = getDoc().nodes
  const old = (nodes[id] as ElementNode | undefined)?.attrs?.[MODAL_ATTR]
  const name = uniquePopupName(nodes, wanted, id)
  if (!old || name === old) return
  updateNodes((all) => {
    const next = { ...all }
    for (const node of Object.values(all)) {
      if (!isElement(node)) continue
      if (node.id === id) next[id] = { ...node, attrs: { ...node.attrs, [MODAL_ATTR]: name } }
      else if (node.attrs[OPEN_ATTR] === old) next[node.id] = { ...node, attrs: { ...node.attrs, [OPEN_ATTR]: name } }
    }
    return next
  })
}

const withAttrs = (node: ElementNode, change: Record<string, string | null>): ElementNode => {
  const attrs = { ...node.attrs }
  for (const [name, value] of Object.entries(change)) if (value === null) delete attrs[name]; else attrs[name] = value
  return { ...node, attrs }
}

/**
 * A data card opens a pop-up (or stops doing so): the card design gets the pop-up's name, and the pop-up becomes a
 * box that shows "the one that was clicked" from the card's data. One undo step.
 */
export function cardOpensPopup(designId: string, popup: { id: string; name: string } | null, source: string) {
  updateNodes((nodes) => {
    let next = patchNode<ElementNode>(nodes, designId, (node) => withAttrs(node, { [OPEN_ATTR]: popup?.name ?? null, [GO_ATTR]: null, [CALL_ATTR]: null }))
    if (popup) next = patchNode<ElementNode>(next, popup.id, (node) => withAttrs(node, { [RECORD_ATTR]: source, [ROW_ATTR]: 'clicked' }))
    return next
  })
  if (popup) track('popup_set', { kind: 'open' })
}
