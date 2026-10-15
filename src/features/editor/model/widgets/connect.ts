import { codeName } from '../data'
import { LIST_ATTR } from '../dataLists'
import { collectSubtreeIds, getAncestorIds } from '../tree/queries'
import { patchNode } from '../tree/treeOps'
import { isElement, type ElementNode, type NodeMap } from '../types'
import { FILTERABLE_ATTR, FOR_ATTR } from './attrs'

/** Searches and filters act on a list of cards or a table: they share a name, kept in `data-ui-filterable` / `data-ui-for`. */
export type FilterTarget = { id: string; name: string; label: string; kind: 'list' | 'table' }

const elementsOf = (nodes: NodeMap) => Object.values(nodes).filter((node): node is ElementNode => isElement(node))

/** A table (with its rows from data or typed in) is one target; so is a "List from data" box that is not inside a table. */
function isTarget(nodes: NodeMap, node: ElementNode): 'list' | 'table' | null {
  if (node.tag === 'table' && node.attrs['data-ui'] === 'table') return 'table'
  // A list inside a filter only supplies its choices.
  const inFilter = () => getAncestorIds(nodes, node.id).some((id) => (nodes[id] as ElementNode | undefined)?.attrs?.['data-ui'] === 'filter')
  if (LIST_ATTR in node.attrs && node.tag !== 'tbody' && !inFilter()) return 'list'
  return null
}

/** Everything on the page a search or filter could act on, with the name it has now (or would get). */
export function filterTargets(nodes: NodeMap): FilterTarget[] {
  const taken = new Set(elementsOf(nodes).map((node) => node.attrs[FILTERABLE_ATTR]).filter(Boolean))
  const found: FilterTarget[] = []
  for (const node of elementsOf(nodes)) {
    const kind = isTarget(nodes, node)
    if (!kind) continue
    let name = node.attrs[FILTERABLE_ATTR]
    if (!name) {
      const base = codeName(kind === 'table' ? 'table' : node.attrs[LIST_ATTR] || 'list', 'results')
      name = base
      for (let n = 2; taken.has(name); n++) name = `${base}${n}`
      taken.add(name)
    }
    found.push({ id: node.id, name, kind, label: kind === 'table' ? 'A table' : `Cards from “${node.attrs[LIST_ATTR]}”` })
  }
  return found
}

/** Gives the target its name (if it has none yet) so searches and filters can find it. */
export const nameTarget = (nodes: NodeMap, target: FilterTarget): NodeMap =>
  patchNode<ElementNode>(nodes, target.id, (node) => ({ ...node, attrs: { ...node.attrs, [FILTERABLE_ATTR]: target.name } }))

/** Points a search or filter (and its "clear" buttons) at a target name; an empty name disconnects it. */
export function pointAt(nodes: NodeMap, widgetId: string, name: string): NodeMap {
  let next = nodes
  for (const id of collectSubtreeIds(nodes, widgetId)) {
    const node = nodes[id]
    if (!isElement(node)) continue
    if (id === widgetId) next = patchNode<ElementNode>(next, id, (item) => ({ ...item, attrs: { ...item.attrs, [FOR_ATTR]: name } }))
    else if ('data-ui-reset' in node.attrs) next = patchNode<ElementNode>(next, id, (item) => ({ ...item, attrs: { ...item.attrs, 'data-ui-reset': name } }))
  }
  return next
}
