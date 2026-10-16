import { removeNode, patchNode } from '../tree/treeOps'
import type { ElementNode, PageDoc } from '../types'
import { INSTANCE_ATTR, OF_ATTR, elementsOf, mainsOf } from './attrs'

/**
 * The page as visitors and downloads get it: main components are only for editing, so they are left out, and
 * the bookkeeping on instances (which box copies which) is dropped. The same page when it has no components.
 */
export function stripComponents(doc: PageDoc): PageDoc {
  const mains = mainsOf(doc.nodes)
  const marked = elementsOf(doc.nodes).filter((node) => OF_ATTR in node.attrs || INSTANCE_ATTR in node.attrs)
  if (!mains.length && !marked.length) return doc
  let nodes = doc.nodes
  for (const main of mains) nodes = removeNode(nodes, main.id)
  for (const node of marked) {
    if (!nodes[node.id]) continue
    nodes = patchNode<ElementNode>(nodes, node.id, (item) => {
      const attrs = { ...item.attrs }
      delete attrs[OF_ATTR]
      delete attrs[INSTANCE_ATTR]
      return { ...item, attrs }
    })
  }
  return { ...doc, nodes }
}
