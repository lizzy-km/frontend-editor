import { htmlToChildNodes } from '../model/parse/domToNodes'
import { getElement } from '../model/tree/queries'
import { insertSubtree, replaceChildren } from '../model/tree/treeOps'
import type { NodeMap } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateNodes } from './commit'

/** Replaces an element's inside with new HTML (output of the text editor). */
export function setInnerHtml(id: string, html: string) {
  const childNodes: NodeMap = {}
  const childIds = htmlToChildNodes(html, id, childNodes)
  updateNodes((nodes) => replaceChildren(nodes, id, childNodes, childIds))
}

/** Tags that can hold other elements (where "Add" puts new things). */
const LEAF_TAGS = new Set(['img', 'input', 'br', 'hr', 'textarea', 'select', 'video', 'iframe', 'svg',
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'span', 'label', 'li'])

/**
 * Where should a new element go? Inside the selection if it's a container,
 * otherwise right after it. With nothing selected: end of the page.
 */
export function resolveInsertTarget(): { parentId: string; index?: number } {
  const doc = getDoc()
  const selected = getElement(doc.nodes, useSelectionStore.getState().selectedId)
  if (!selected) return { parentId: doc.rootId }
  if (!LEAF_TAGS.has(selected.tag)) return { parentId: selected.id }

  const parent = getElement(doc.nodes, selected.parentId)
  if (!parent) return { parentId: doc.rootId }
  return { parentId: parent.id, index: parent.children.indexOf(selected.id) + 1 }
}

/** Parses an HTML snippet and inserts it. Returns the id of the first new element. */
export function insertHtml(html: string, target = resolveInsertTarget()): string | null {
  const created: NodeMap = {}
  const ids = htmlToChildNodes(html, target.parentId, created)
  const firstElement = ids.find((id) => created[id]?.kind === 'element') ?? null

  updateNodes((nodes) => {
    let next = nodes
    ids.forEach((id, offset) => {
      const index = target.index === undefined ? undefined : target.index + offset
      next = insertSubtree(next, created, id, target.parentId, index)
    })
    return next
  })
  if (firstElement) useSelectionStore.getState().select(firstElement)
  return firstElement
}
