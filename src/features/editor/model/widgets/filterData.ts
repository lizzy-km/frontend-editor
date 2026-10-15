import { BIND_PREFIX, LIST_ATTR, showValue } from '../dataLists'
import { htmlToChildNodes } from '../parse/domToNodes'
import { collectSubtreeIds, getElement } from '../tree/queries'
import { replaceChildren } from '../tree/treeOps'
import { isElement, type DataSource, type ElementNode, type NodeMap, type PageDoc } from '../types'
import { FILTERABLE_ATTR } from './attrs'
import { setAttrs } from './edit'
import { checksInner, checksLiveInner, chipsInner, chipsLiveInner, selectInner } from './blocksTable'

/** Filters that offer the real values of a data field ("Clothing", "Bags"…) and match items by that field. */

const elements = (nodes: NodeMap) => Object.values(nodes).filter((node): node is ElementNode => isElement(node))

/** The list box (cards) or rows box (table) a target name points at, with the data source behind it. */
export function targetBox(doc: PageDoc, name: string): { box: ElementNode; source: DataSource } | null {
  const target = elements(doc.nodes).find((node) => node.attrs[FILTERABLE_ATTR] === name)
  if (!target) return null
  const box = LIST_ATTR in target.attrs ? target : collectSubtreeIds(doc.nodes, target.id).map((id) => getElement(doc.nodes, id)).find((node) => node && LIST_ATTR in node.attrs)
  const source = box && doc.data?.find((item) => item.name === box.attrs[LIST_ATTR])
  return box && source ? { box, source } : null
}

/** The fields a filter can use (not pictures or long texts). */
export const filterFields = (source: DataSource) => source.fields.filter((field) => field.type !== 'image' && field.type !== 'longText')

/** The different values of a field, in the order they first appear. */
export function fieldValues(source: DataSource, field: string): string[] {
  const seen = new Set<string>()
  for (const row of source.rows) {
    const value = showValue(row[field]).trim()
    if (value) seen.add(value)
  }
  return [...seen].slice(0, 30)
}

const INNER: Record<string, (choices: string[]) => string> = { chips: chipsInner, select: selectInner, checks: checksInner }
const LIVE: Record<string, (source: string, field: string) => string> = { chips: chipsLiveInner, checks: checksLiveInner }

/** Where a filter's choices come from when it is not the list's own values: another data source and the field to show. */
export type ChoicesFrom = { source: string; field: string }
export const CHOICES_ATTR = 'data-ui-choices'

/** The setting as saved on the filter ("categories.name"), or null for the list's own values. */
export function choicesOf(widget: ElementNode): ChoicesFrom | null {
  const [source, field] = (widget.attrs[CHOICES_ATTR] ?? '').split('.')
  return source && field ? { source, field } : null
}

/**
 * Makes a filter use a data field: the item design gets the field as an attribute, the filter matches on it,
 * and its buttons / options become the field's real values. An empty field goes back to matching any text.
 * `choices` takes the buttons from ANOTHER data source (a categories list): buttons and tick boxes are then a live
 * list of that source; a drop-down gets that source's values as they are now.
 */
export function filterByField(doc: PageDoc, widgetId: string, field: string, choices: ChoicesFrom | null = null): PageDoc {
  const widget = getElement(doc.nodes, widgetId)
  if (!widget) return doc
  const found = targetBox(doc, widget.attrs['data-ui-for'] ?? '')
  const other = choices && doc.data?.find((item) => item.name === choices.source)
  let nodes = setAttrs(doc.nodes, widgetId, { 'data-ui-by': field || null, [CHOICES_ATTR]: other ? `${choices.source}.${choices.field}` : null })
  const design = found && field ? found.box.children.map((id) => getElement(nodes, id)).find(Boolean) : undefined
  if (design) nodes = setAttrs(nodes, design.id, { [`${BIND_PREFIX}data-${field}`]: field })
  const source = other ?? (found && field ? found.source : undefined)
  if (!source) return { ...doc, nodes }
  const kind = widget.attrs['data-ui-kind'] ?? 'chips'
  const holder = kind === 'select' ? collectSubtreeIds(nodes, widgetId).find((id) => getElement(nodes, id)?.tag === 'select') : widgetId
  const live = other && LIVE[kind]
  const html = live ? live(other.name, choices.field) : INNER[kind]!(fieldValues(source, other ? choices.field : field))
  const created: NodeMap = {}
  const ids = htmlToChildNodes(html, holder ?? widgetId, created)
  return { ...doc, nodes: replaceChildren(nodes, holder ?? widgetId, created, ids) }
}
