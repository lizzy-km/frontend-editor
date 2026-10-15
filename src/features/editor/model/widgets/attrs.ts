import { isElement, type ElementNode, type NodeMap } from '../types'

/**
 * Ready-made interface parts (tabs, select, calendar…) are plain HTML. Their behaviour hooks are
 * `data-ui-*` attributes, which (unlike `data-fe-*`) also stay in the React download, where one
 * small script (`widgets.ts`) handles every click.
 */
export const UI_ATTR = 'data-ui'

export type WidgetKind = 'tabs' | 'menu' | 'select' | 'datepicker' | 'calendar' | 'table' | 'field' | 'switch' | 'search' | 'filter'

/** Marks a list or table that searches and filters act on; their `data-ui-for` holds the same name. */
export const FILTERABLE_ATTR = 'data-ui-filterable'
export const FOR_ATTR = 'data-ui-for'

export const isWidget = (node: unknown): node is ElementNode => isElement(node as ElementNode) && UI_ATTR in (node as ElementNode).attrs

/** The kind of a widget's top box (null when the element is not one). */
export const widgetKind = (node: unknown): WidgetKind | null => (isWidget(node) ? (node.attrs[UI_ATTR] as WidgetKind) : null)

/** The kinds of widget a page uses (decides whether the script and the React file are added). */
export function widgetKindsIn(nodes: NodeMap): Set<WidgetKind> {
  const kinds = new Set<WidgetKind>()
  for (const node of Object.values(nodes)) if (isWidget(node)) kinds.add(node.attrs[UI_ATTR] as WidgetKind)
  return kinds
}

/** The closest widget around (or equal to) an element, so settings and the editor follow it. */
export function widgetAround(nodes: NodeMap, id: string | null): ElementNode | null {
  for (let current = id; current; current = nodes[current]?.parentId ?? null) if (isWidget(nodes[current])) return nodes[current] as ElementNode
  return null
}
