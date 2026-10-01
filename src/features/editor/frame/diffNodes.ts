import type { NodeMap } from '../model/types'

/** What the frame needs after an edit: changed nodes and removed ids. */
export type NodeDiff = { changed: NodeMap; removed: string[] }

/** Only the nodes that changed (the model is immutable, so a reference check is enough). */
export function diffNodes(next: NodeMap, prev: NodeMap): NodeDiff {
  const changed: NodeMap = {}
  for (const id in next) if (next[id] !== prev[id]) changed[id] = next[id]!
  const removed = Object.keys(prev).filter((id) => !(id in next))
  return { changed, removed }
}
