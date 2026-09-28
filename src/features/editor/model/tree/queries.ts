import { isElement, type ElementNode, type NodeMap } from '../types'

export function getElement(nodes: NodeMap, id: string | null | undefined): ElementNode | undefined {
  const node = id ? nodes[id] : undefined
  return isElement(node) ? node : undefined
}

/** Ids from the node up to the root, not including the node itself. */
export function getAncestorIds(nodes: NodeMap, id: string): string[] {
  const ids: string[] = []
  let parentId = nodes[id]?.parentId ?? null
  while (parentId) {
    ids.push(parentId)
    parentId = nodes[parentId]?.parentId ?? null
  }
  return ids
}

/** True if `id` is `ancestorId` itself or somewhere inside it. */
export function isInside(nodes: NodeMap, id: string, ancestorId: string): boolean {
  return id === ancestorId || getAncestorIds(nodes, id).includes(ancestorId)
}

/** Position of a node among its parent's children (-1 for the root). */
export function indexInParent(nodes: NodeMap, id: string): number {
  const parent = getElement(nodes, nodes[id]?.parentId)
  return parent ? parent.children.indexOf(id) : -1
}

/** Every id in the subtree, the node first. */
export function collectSubtreeIds(nodes: NodeMap, id: string): string[] {
  const ids = [id]
  for (let i = 0; i < ids.length; i++) {
    const node = getElement(nodes, ids[i])
    if (node) ids.push(...node.children)
  }
  return ids
}

/** All visible text inside a node, squashed to single spaces. */
export function getTextContent(nodes: NodeMap, id: string): string {
  const node = nodes[id]
  if (!node) return ''
  if (node.kind === 'text') return node.text
  return node.children.map((childId) => getTextContent(nodes, childId)).join('').replace(/\s+/g, ' ').trim()
}
