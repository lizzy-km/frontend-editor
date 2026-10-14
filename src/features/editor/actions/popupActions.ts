import { track } from '@/features/analytics/track'
import { ASK_ATTR, CLOSE_ATTR, MODAL_ATTR, OPEN_ATTR, uniquePopupName } from '../model/popups'
import { getDoc } from '../store/doc.store'
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

/** Renames a pop-up and every opener that pointed at it. */
export function renamePopup(id: string, wanted: string) {
  const doc = getDoc()
  const old = (doc.nodes[id] as { attrs?: Record<string, string> } | undefined)?.attrs?.[MODAL_ATTR]
  const name = uniquePopupName(doc.nodes, wanted, id)
  if (!old || name === old) return
  const openers = Object.values(doc.nodes).filter((node) => node.kind === 'element' && node.attrs[OPEN_ATTR] === old).map((node) => node.id)
  setAttributes(id, { [MODAL_ATTR]: name })
  for (const opener of openers) setAttribute(opener, OPEN_ATTR, name)
}
