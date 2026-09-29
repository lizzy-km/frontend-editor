import { getNodeElement, useFrameStore } from '../frame/frame.store'
import { getElement, isInside } from '../model/tree/queries'
import type { NodeMap } from '../model/types'
import { getDoc } from '../store/doc.store'
import { nodeIdAt, toOverlayBox, type Box, type FramePlacement } from './geometry'

export type DropTarget = { parentId: string; index: number; indicator: Box }

/** Elements that can't contain other elements. */
const LEAF_TAGS = new Set(['img', 'input', 'textarea', 'select', 'br', 'hr', 'video', 'iframe', 'svg',
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'span', 'strong', 'em', 'label', 'i'])

export const canContainChildren = (tag: string) => !LEAF_TAGS.has(tag)

/** Does this container lay its children out side by side? */
function isHorizontal(element: Element): boolean {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element)
  if (!style) return false
  if (style.display.includes('flex')) return !style.flexDirection.startsWith('column')
  if (style.display.includes('grid')) return style.gridTemplateColumns.split(' ').length > 1
  return false
}

/** Child elements of a node with their index in `children` and their overlay box. */
function childBoxes(nodes: NodeMap, parentId: string, draggedId: string, placement: FramePlacement) {
  const parent = getElement(nodes, parentId)
  if (!parent) return []
  return parent.children.flatMap((id, index) => {
    const element = id === draggedId ? null : getNodeElement(id)
    return element && nodes[id]?.kind === 'element' ? [{ index, box: toOverlayBox(element, placement) }] : []
  })
}

/** Picks the slot between children closest to the pointer and a line to show it. */
function slotInside(nodes: NodeMap, parentId: string, draggedId: string, x: number, y: number, placement: FramePlacement): DropTarget | null {
  const parentElement = getNodeElement(parentId)
  if (!parentElement) return null
  const horizontal = isHorizontal(parentElement)
  const children = childBoxes(nodes, parentId, draggedId, placement)
  const parentBox = toOverlayBox(parentElement, placement)

  if (children.length === 0) {
    const index = getElement(nodes, parentId)?.children.length ?? 0
    return { parentId, index, indicator: { ...parentBox, y: parentBox.y + parentBox.height / 2 - 1, height: 3 } }
  }

  const pointer = horizontal ? x : y
  const before = children.find(({ box }) => pointer < (horizontal ? box.x + box.width / 2 : box.y + box.height / 2))
  const edge = before ?? children[children.length - 1]!
  const index = before ? before.index : edge.index + 1
  const at = before ? (horizontal ? edge.box.x : edge.box.y) : (horizontal ? edge.box.x + edge.box.width : edge.box.y + edge.box.height)

  const indicator = horizontal
    ? { x: at - 1.5, y: edge.box.y, width: 3, height: edge.box.height }
    : { x: edge.box.x, y: at - 1.5, width: edge.box.width, height: 3 }
  return { parentId, index, indicator }
}

/** Is `hitId` one of the dragged element's siblings (or inside one)? */
function isOverSibling(nodes: NodeMap, hitId: string, draggedId: string): boolean {
  const siblingParent = nodes[draggedId]?.parentId
  let id: string | null = hitId
  while (id) {
    const parentId: string | null = nodes[id]?.parentId ?? null
    if (parentId === siblingParent) return id !== draggedId
    id = parentId
  }
  return false
}

/**
 * Where would `draggedId` land if dropped at (x, y)?
 * Over a sibling (e.g. card onto card) -> reorder among siblings.
 * Over another container -> inside it, between its children.
 * Over a leaf (text, picture, button) -> before/after it in its parent.
 */
export function findDropTarget(draggedId: string, x: number, y: number, placement: FramePlacement): DropTarget | null {
  if (!useFrameStore.getState().iframe) return null
  const nodes = getDoc().nodes
  const hitId = nodeIdAt(x, y, placement)
  if (!hitId || isInside(nodes, hitId, draggedId)) return null

  const hit = getElement(nodes, hitId)
  if (!hit) return null
  const containerId = isOverSibling(nodes, hitId, draggedId)
    ? nodes[draggedId]?.parentId
    : canContainChildren(hit.tag) ? hit.id : hit.parentId
  return containerId ? slotInside(nodes, containerId, draggedId, x, y, placement) : null
}
