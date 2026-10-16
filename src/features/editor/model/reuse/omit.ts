import { removeNode, patchNode } from '../tree/treeOps'
import type { ElementNode, PageDoc } from '../types'
import { INSTANCE_ATTR, KEY_ATTR, LIBRARY_ATTR, OF_ATTR, PART_ATTR, VARIANT_ATTR, elementsOf, mainsOf } from './attrs'

/**
 * The page as visitors and downloads get it: main components are only for editing, so they are left out, and
 * the bookkeeping on instances (which box copies which) is dropped. The same page when it has no components.
 */
export function stripComponents(doc: PageDoc): PageDoc {
  const mains = mainsOf(doc.nodes)
  const BOOKKEEPING = [OF_ATTR, INSTANCE_ATTR, KEY_ATTR, PART_ATTR, VARIANT_ATTR, LIBRARY_ATTR]
  const marked = elementsOf(doc.nodes).filter((node) => BOOKKEEPING.some((name) => name in node.attrs))
  if (!mains.length && !marked.length) return doc
  let nodes = doc.nodes
  for (const main of mains) nodes = removeNode(nodes, main.id)
  for (const node of marked) {
    if (!nodes[node.id]) continue
    nodes = patchNode<ElementNode>(nodes, node.id, (item) => {
      const attrs = { ...item.attrs }
      for (const name of BOOKKEEPING) delete attrs[name]
      return { ...item, attrs }
    })
  }
  return { ...doc, nodes }
}
