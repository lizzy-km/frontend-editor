import type { EditorNode, ElementNode, NodeMap } from '../types'
import { collectSubtreeIds, getElement, isInside } from './queries'

/**
 * Pure tree edits. Each returns a NEW node map and never mutates the input,
 * so untouched nodes keep their identity (fast re-render checks, cheap undo).
 */

/** Replaces one node with a changed copy. */
export function patchNode<T extends EditorNode>(nodes: NodeMap, id: string, change: (node: T) => T): NodeMap {
  const node = nodes[id] as T | undefined
  return node ? { ...nodes, [id]: change(node) } : nodes
}

/** Puts `childId` into `parentId.children` at `index` (end when omitted). */
function attachChild(nodes: NodeMap, parentId: string, childId: string, index?: number): NodeMap {
  return patchNode<ElementNode>(nodes, parentId, (parent) => {
    const children = [...parent.children]
    children.splice(index ?? children.length, 0, childId)
    return { ...parent, children }
  })
}

function detachChild(nodes: NodeMap, childId: string): NodeMap {
  const parentId = nodes[childId]?.parentId
  if (!parentId) return nodes
  return patchNode<ElementNode>(nodes, parentId, (parent) => ({
    ...parent,
    children: parent.children.filter((id) => id !== childId),
  }))
}

/** Adds already-built nodes (e.g. from cloneSubtree) under a parent. */
export function insertSubtree(nodes: NodeMap, subtree: NodeMap, topId: string, parentId: string, index?: number): NodeMap {
  const top = subtree[topId]
  if (!top || !getElement(nodes, parentId)) return nodes
  const merged = { ...nodes, ...subtree, [topId]: { ...top, parentId } }
  return attachChild(merged, parentId, topId, index)
}

/** Deletes a node and everything inside it. */
export function removeNode(nodes: NodeMap, id: string): NodeMap {
  const next = detachChild(nodes, id)
  const result = { ...next }
  for (const removedId of collectSubtreeIds(nodes, id)) delete result[removedId]
  return result
}

/** Moves a node to a new parent/position. Refuses to move a node into itself. */
export function moveNode(nodes: NodeMap, id: string, parentId: string, index: number): NodeMap {
  const node = nodes[id]
  if (!node || isInside(nodes, parentId, id)) return nodes

  // If moving later within the same parent, removing it first shifts the index.
  const oldParent = getElement(nodes, node.parentId)
  const oldIndex = oldParent?.children.indexOf(id) ?? -1
  const adjusted = node.parentId === parentId && oldIndex !== -1 && oldIndex < index ? index - 1 : index

  const detached = detachChild(nodes, id)
  const reparented = { ...detached, [id]: { ...node, parentId } }
  return attachChild(reparented, parentId, id, adjusted)
}

/** Swaps a node's children for new ones (used after rich-text editing). */
export function replaceChildren(nodes: NodeMap, id: string, childNodes: NodeMap, childIds: string[]): NodeMap {
  const element = getElement(nodes, id)
  if (!element) return nodes
  let next = { ...nodes }
  for (const oldChildId of element.children) next = removeNode(next, oldChildId)
  next = { ...next, ...childNodes }
  return patchNode<ElementNode>(next, id, (node) => ({ ...node, children: childIds }))
}
