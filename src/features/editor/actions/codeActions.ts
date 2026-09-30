import { htmlToChildNodes } from '../model/parse/domToNodes'
import { childrenToHtml, nodeToHtml } from '../model/serialize/nodeToHtml'
import { collectSubtreeIds, getElement, indexInParent } from '../model/tree/queries'
import { insertSubtree, removeNode, replaceChildren } from '../model/tree/treeOps'
import { isElement, type NodeMap } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateNodes } from './commit'

const FOR_EDITING = { forEditing: true } as const

/**
 * A part of the page (or the whole page body when `id` is the root) as HTML
 * the user can edit. Computer-view edits appear as style="…".
 */
export function editableHtml(id: string): string {
  const doc = getDoc()
  const node = getElement(doc.nodes, id)
  if (!node) return ''
  return id === doc.rootId ? childrenToHtml(doc.nodes, node, FOR_EDITING) : nodeToHtml(doc.nodes, id, FOR_EDITING)
}

/** Tablet/phone-only edits can't be written as HTML — applying code would drop them. */
export function hasScreenSizeEdits(id: string): boolean {
  const { nodes } = getDoc()
  return collectSubtreeIds(nodes, id).some((nodeId) => {
    const node = nodes[nodeId]
    return isElement(node) && Boolean(node.styles.tablet || node.styles.mobile)
  })
}

/** Replaces the page body's content. */
function replaceBody(nodes: NodeMap, rootId: string, html: string): NodeMap {
  const created: NodeMap = {}
  const ids = htmlToChildNodes(html, rootId, created)
  return replaceChildren(nodes, rootId, created, ids)
}

/** Replaces one element with whatever the new HTML contains (0, 1 or more elements). */
function replaceElement(nodes: NodeMap, id: string, html: string): { nodes: NodeMap; firstId: string | null } {
  const parentId = nodes[id]?.parentId
  if (!parentId) return { nodes, firstId: null }
  const index = indexInParent(nodes, id)
  const created: NodeMap = {}
  const ids = htmlToChildNodes(html, parentId, created)
  let next = removeNode(nodes, id)
  ids.forEach((newId, offset) => { next = insertSubtree(next, created, newId, parentId, index + offset) })
  return { nodes: next, firstId: ids.find((newId) => created[newId]?.kind === 'element') ?? null }
}

/**
 * Applies edited HTML to a part of the page (or the whole body) as ONE undo
 * step, and selects the result so the user sees what changed.
 */
export function applyHtml(id: string, html: string) {
  const { rootId } = getDoc()
  let firstId: string | null = null
  updateNodes((nodes) => {
    if (id === rootId) return replaceBody(nodes, rootId, html)
    const result = replaceElement(nodes, id, html)
    firstId = result.firstId
    return result.nodes
  })
  useSelectionStore.getState().select(id === rootId ? null : firstId)
}
