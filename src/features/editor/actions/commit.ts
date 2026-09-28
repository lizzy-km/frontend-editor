import type { NodeMap, PageDoc } from '../model/types'
import { getDoc, useDocStore } from '../store/doc.store'

/** Applies a change to the node tree as one undo step. */
export function updateNodes(change: (nodes: NodeMap) => NodeMap, coalesceKey?: string) {
  const doc = getDoc()
  const nodes = change(doc.nodes)
  if (nodes !== doc.nodes) useDocStore.getState().commit({ ...doc, nodes }, coalesceKey)
}

/** Applies a change to page-level fields (title, css, scripts...). */
export function updateDoc(change: (doc: PageDoc) => PageDoc, coalesceKey?: string) {
  useDocStore.getState().commit(change(getDoc()), coalesceKey)
}
