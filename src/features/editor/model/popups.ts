import { codeName } from './data'
import { isElement, type EditorNode, type ElementNode, type NodeMap } from './types'

/**
 * Pop-ups (modals) and "ask first" are plain attributes:
 *  - data-fe-modal="name" on the pop-up box (shown as a normal box while editing)
 *  - data-fe-open="name" on whatever opens it, data-fe-close on whatever closes it
 *  - data-fe-ask="Are you sure?" on a button or link: visitors must confirm first
 */
export const MODAL_ATTR = 'data-fe-modal'
export const OPEN_ATTR = 'data-fe-open'
export const CLOSE_ATTR = 'data-fe-close'
export const ASK_ATTR = 'data-fe-ask'

export const isPopup = (node: EditorNode | undefined): node is ElementNode => isElement(node) && MODAL_ATTR in node.attrs

/** The pop-ups of a page: id and name, in page order. */
export function popupsOf(nodes: NodeMap): { id: string; name: string }[] {
  return Object.values(nodes).filter(isPopup).map((node) => ({ id: node.id, name: node.attrs[MODAL_ATTR]! }))
}

/** A pop-up name nobody uses yet: "welcome", "welcome2"… */
export function uniquePopupName(nodes: NodeMap, wanted: string, ignoreId?: string): string {
  const taken = new Set(Object.values(nodes).filter((node) => isPopup(node) && node.id !== ignoreId).map((node) => (node as ElementNode).attrs[MODAL_ATTR]))
  const base = codeName(wanted, 'popup')
  let name = base
  for (let n = 2; taken.has(name); n++) name = `${base}${n}`
  return name
}

/** Does anything in the page use pop-ups, or ask first? (Decides whether the players and ui files are added.) */
export function popupUse(nodes: NodeMap): { modal: boolean; ask: boolean } {
  let modal = false
  let ask = false
  for (const node of Object.values(nodes)) {
    if (!isElement(node)) continue
    modal ||= MODAL_ATTR in node.attrs || OPEN_ATTR in node.attrs || CLOSE_ATTR in node.attrs
    ask ||= Boolean(node.attrs[ASK_ATTR])
  }
  return { modal, ask }
}

const BUTTON = 'font: inherit; font-weight: 700; padding: 12px 20px; border: 0; border-radius: 10px; background: #1c1917; color: #fff; cursor: pointer'

/** A button that opens a pop-up, and the pop-up itself (a box over the page for visitors; a normal box while editing). */
export const popupBlockHtml = (name: string) =>
  `<button type="button" ${OPEN_ATTR}="${name}" style="${BUTTON}">Open the pop-up</button>`
  + `<div ${MODAL_ATTR}="${name}" style="padding: 40px 24px; background: rgba(28, 25, 23, .55)">`
  + '<div style="max-width: 440px; margin: 0 auto; padding: 32px; border-radius: 18px; background: #fff; box-shadow: 0 24px 60px -20px rgba(0, 0, 0, .5); text-align: center">'
  + '<h2 style="margin: 0 0 8px">A message for you</h2><p style="margin: 0 0 20px; color: #57534e">Use a pop-up for news, a sign-up or a quick question. Visitors close it with the button, the Esc key, or by clicking outside.</p>'
  + `<button type="button" ${CLOSE_ATTR} style="${BUTTON}">Got it</button></div></div>`

/** A button that asks before it does anything. */
export const askButtonHtml = '<button type="button" data-fe-ask="Are you sure you want to delete this?" style="font: inherit; font-weight: 700; padding: 12px 20px; border: 0; border-radius: 10px; background: #b91c1c; color: #fff; cursor: pointer">Delete</button>'
