import { cloneSubtree } from '../tree/cloneSubtree'
import { collectSubtreeIds, getAncestorIds, getElement, indexInParent } from '../tree/queries'
import { insertSubtree, patchNode, removeNode } from '../tree/treeOps'
import { isElement, type ElementNode, type NodeMap, type TextNode } from '../types'

/** Structural edits for widgets: add or remove a tab, set a select's choices, grow or shrink a table. All pure: nodes in, nodes out. */

const attrsOf = (nodes: NodeMap, id: string, change: Record<string, string | null>) =>
  patchNode<ElementNode>(nodes, id, (node) => {
    const attrs = { ...node.attrs }
    for (const [name, value] of Object.entries(change)) if (value === null) delete attrs[name]; else attrs[name] = value
    return { ...node, attrs }
  })

/** Sets the first piece of text inside an element (formatting around it stays). */
export function setFirstText(nodes: NodeMap, id: string, text: string): NodeMap {
  const textId = collectSubtreeIds(nodes, id).find((item) => nodes[item]?.kind === 'text' && (nodes[item] as TextNode).text.trim() !== '')
  return textId ? patchNode<TextNode>(nodes, textId, (node) => ({ ...node, text })) : nodes
}

/** Elements with an attribute that belong to this widget, not to a widget of the same kind nested inside it. */
function owned(nodes: NodeMap, rootId: string, attr: string): ElementNode[] {
  const kind = getElement(nodes, rootId)?.attrs['data-ui']
  return collectSubtreeIds(nodes, rootId).slice(1).map((id) => getElement(nodes, id)).filter((node): node is ElementNode => {
    if (!node || !(attr in node.attrs)) return false
    return getAncestorIds(nodes, node.id).find((id) => getElement(nodes, id)?.attrs['data-ui'] === kind) === rootId
  })
}

/** The tab buttons and panels of a tabs widget, in page order. */
export const tabsOf = (nodes: NodeMap, rootId: string) => ({ tabs: owned(nodes, rootId, 'data-ui-tab'), panels: owned(nodes, rootId, 'data-ui-panel') })

function copyAfter(nodes: NodeMap, id: string): { nodes: NodeMap; copyId: string } {
  const copy = cloneSubtree(nodes, id)
  const parentId = nodes[id]!.parentId!
  return { nodes: insertSubtree(nodes, copy.nodes, copy.topId, parentId, indexInParent(nodes, id) + 1), copyId: copy.topId }
}

/** Adds a tab (a copy of the last one, with a copy of its panel) named "Tab N". */
export function addTab(nodes: NodeMap, rootId: string): NodeMap {
  const { tabs, panels } = tabsOf(nodes, rootId)
  const lastTab = tabs.at(-1)
  const lastPanel = panels.at(-1)
  if (!lastTab || !lastPanel) return nodes
  const used = new Set(tabs.map((tab) => tab.attrs['data-ui-tab']))
  let key = `tab-${tabs.length + 1}`
  for (let n = tabs.length + 2; used.has(key); n++) key = `tab-${n}`
  const label = `Tab ${tabs.length + 1}`
  const tab = copyAfter(nodes, lastTab.id)
  const panel = copyAfter(tab.nodes, lastPanel.id)
  let next = attrsOf(panel.nodes, tab.copyId, { 'data-ui-tab': key, 'aria-selected': 'false', tabindex: '-1' })
  next = setFirstText(next, tab.copyId, label)
  next = attrsOf(next, panel.copyId, { 'data-ui-panel': key, hidden: '' })
  return setFirstText(next, panel.copyId, label)
}

/** Removes the last tab and its panel (at least one stays). If it was open, the first tab opens. */
export function removeTab(nodes: NodeMap, rootId: string): NodeMap {
  const { tabs, panels } = tabsOf(nodes, rootId)
  if (tabs.length < 2) return nodes
  const tab = tabs.at(-1)!
  let next = removeNode(removeNode(nodes, panels.find((panel) => panel.attrs['data-ui-panel'] === tab.attrs['data-ui-tab'])?.id ?? ''), tab.id)
  if (tab.attrs['aria-selected'] === 'true') {
    next = attrsOf(next, tabs[0]!.id, { 'aria-selected': 'true', tabindex: null })
    next = attrsOf(next, panels[0]!.id, { hidden: null })
  }
  return next
}

/** Replaces a select list's options with one option per line (the first option's look is copied). */
export function setOptions(nodes: NodeMap, rootId: string, lines: string[]): NodeMap {
  const options = owned(nodes, rootId, 'data-ui-option')
  const first = options[0]
  const wanted = lines.map((line) => line.trim()).filter(Boolean)
  if (!first || !wanted.length) return nodes
  const parentId = first.parentId!
  const at = indexInParent(nodes, first.id)
  let next = nodes
  for (const option of options) next = removeNode(next, option.id)
  wanted.forEach((line, offset) => {
    const copy = cloneSubtree(nodes, first.id)
    next = insertSubtree(next, copy.nodes, copy.topId, parentId, at + offset)
    next = attrsOf(next, copy.topId, { 'data-value': line, 'aria-selected': 'false' })
    next = setFirstText(next, copy.topId, line)
  })
  return next
}

/** The text of each option, one per line. */
export const optionLines = (nodes: NodeMap, rootId: string): string[] =>
  owned(nodes, rootId, 'data-ui-option').map((option) => collectSubtreeIds(nodes, option.id).map((id) => (nodes[id]?.kind === 'text' ? (nodes[id] as TextNode).text : '')).join('').trim())

const rowsOf = (nodes: NodeMap, tableId: string) => collectSubtreeIds(nodes, tableId).map((id) => getElement(nodes, id)).filter((node): node is ElementNode => node?.tag === 'tr')

/** Adds a row below the last one (a copy of it), or removes the last row. Rows that come from data are not touched. */
export function changeRows(nodes: NodeMap, tableId: string, add: boolean): NodeMap {
  const body = rowsOf(nodes, tableId).filter((row) => getElement(nodes, row.parentId)?.tag === 'tbody')
  const last = body.at(-1)
  if (!last || (!add && body.length < 2)) return nodes
  return add ? copyAfter(nodes, last.id).nodes : removeNode(nodes, last.id)
}

/** Adds a column at the end (copies of the last cell in every row), or removes the last column. */
export function changeColumns(nodes: NodeMap, tableId: string, add: boolean): NodeMap {
  let next = nodes
  const rows = rowsOf(nodes, tableId)
  if (!add && (rows[0]?.children.filter((id) => isElement(nodes[id])).length ?? 0) < 2) return nodes
  for (const row of rows) {
    const cells = row.children.filter((id) => isElement(nodes[id]))
    const last = cells.at(-1)
    if (!last) continue
    if (!add) { next = removeNode(next, last); continue }
    const copy = copyAfter(next, last)
    next = setFirstText(attrsOf(copy.nodes, copy.copyId, { 'aria-sort': null }), copy.copyId, row.parentId && getElement(next, row.parentId)?.tag === 'thead' ? 'New column' : '—')
  }
  return next
}

/** Adds or removes a CSS class on an element (e.g. a table's "striped" look). */
export function toggleClass(nodes: NodeMap, id: string, name: string, on: boolean): NodeMap {
  return patchNode<ElementNode>(nodes, id, (node) => {
    const names = (node.attrs.class ?? '').split(/\s+/).filter(Boolean).filter((item) => item !== name)
    return { ...node, attrs: { ...node.attrs, class: [...names, ...(on ? [name] : [])].join(' ') } }
  })
}

/** Replaces the tabs look class (`ui-tabs--pills` …); "line" is the plain one. */
export function setTabsStyle(nodes: NodeMap, id: string, style: string): NodeMap {
  const node = getElement(nodes, id)
  const names = (node?.attrs.class ?? 'ui-tabs').split(/\s+/).filter((item) => item && !item.startsWith('ui-tabs--'))
  return attrsOf(nodes, id, { class: [...names, ...(style === 'line' ? [] : [`ui-tabs--${style}`])].join(' ') })
}

export { attrsOf as setAttrs }
