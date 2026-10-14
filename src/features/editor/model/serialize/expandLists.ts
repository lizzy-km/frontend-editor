import { createId } from '@/lib/ids'
import { bindingsOf, isListBox, listInfo, rowsFor, showValue } from '../dataLists'
import { cloneSubtree } from '../tree/cloneSubtree'
import { collectSubtreeIds } from '../tree/queries'
import { isElement, type DataValue, type ElementNode, type NodeMap, type PageDoc } from '../types'

/** One filled-in card: bound text replaced, bound attributes set. */
function fillCard(nodes: NodeMap, topId: string, row: Record<string, DataValue>): NodeMap {
  const next: NodeMap = { ...nodes }
  for (const id of collectSubtreeIds(nodes, topId)) {
    const node = nodes[id]
    if (!isElement(node)) continue
    const bindings = bindingsOf(node)
    if (!Object.keys(bindings).length) continue
    const attrs = { ...node.attrs }
    for (const [attr, field] of Object.entries(bindings)) if (attr !== 'text') attrs[attr] = showValue(row[field])
    let children = node.children
    if (bindings.text) {
      for (const child of node.children) for (const gone of collectSubtreeIds(next, child)) delete next[gone]
      const textId = createId()
      next[textId] = { id: textId, kind: 'text', parentId: id, text: showValue(row[bindings.text]) }
      children = [textId]
    }
    next[id] = { ...node, attrs, children }
  }
  return next
}

/**
 * "List from data" boxes with real rows instead of the one card design (for
 * Preview and downloads, where nothing loads live). Boxes without rows keep their design.
 */
export function expandDataLists(doc: PageDoc): PageDoc {
  const boxes = Object.values(doc.nodes).filter((node): node is ElementNode => isListBox(node))
  if (!boxes.length) return doc
  let nodes: NodeMap = { ...doc.nodes }
  for (const box of boxes) {
    const info = listInfo(nodes, box.id)
    const rows = info ? rowsFor(info, doc.data) : []
    if (!info?.templateId || rows.length === 0) continue
    const cards: string[] = []
    for (const row of rows) {
      const copy = cloneSubtree(nodes, info.templateId)
      nodes = fillCard({ ...nodes, ...copy.nodes, [copy.topId]: { ...copy.nodes[copy.topId]!, parentId: box.id } }, copy.topId, row)
      cards.push(copy.topId)
    }
    for (const gone of collectSubtreeIds(nodes, info.templateId)) delete nodes[gone]
    const current = nodes[box.id] as ElementNode
    nodes[box.id] = { ...current, children: current.children.flatMap((id) => (id === info.templateId ? cards : nodes[id] ? [id] : [])) }
  }
  return { ...doc, nodes }
}
