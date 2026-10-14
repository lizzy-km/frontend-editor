import { track } from '@/features/analytics/track'
import { ASK_ATTR, CLOSE_ATTR, MODAL_ATTR, OPEN_ATTR, uniquePopupName } from '../model/popups'
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
