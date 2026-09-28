import { createId } from '@/lib/ids'
import type { NodeMap } from '../types'

/**
 * Deep-copies a node and its descendants with fresh ids.
 * Used for duplicate, copy/paste and "insert block".
 * HTML `id` attributes are dropped from the copy so the page never gets duplicate ids.
 */
export function cloneSubtree(nodes: NodeMap, id: string): { nodes: NodeMap; topId: string } {
  const copies: NodeMap = {}

  function copy(sourceId: string, parentId: string | null): string {
    const source = nodes[sourceId]
    if (!source) return ''
    const newId = createId()

    if (source.kind === 'text') {
      copies[newId] = { ...source, id: newId, parentId }
      return newId
    }

    const attrs = { ...source.attrs }
    delete attrs.id
    copies[newId] = {
      ...source,
      id: newId,
      parentId,
      attrs,
      children: source.children.map((childId) => copy(childId, newId)).filter(Boolean),
    }
    return newId
  }

  const topId = copy(id, nodes[id]?.parentId ?? null)
  return { nodes: copies, topId }
}
