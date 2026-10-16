import { fillPath } from './routes'
import { getElement } from './tree/queries'
import { isElement, type DataSource, type DataValue, type ElementNode, type NodeMap } from './types'

/**
 * "List from data": a box whose FIRST element child is the card design
 * (template). Inside it, elements show fields of a data source:
 *   <div data-fe-list="products" data-fe-page-size="6" data-fe-load="scroll">
 *     <article><img data-fe-bind-src="image"><h3 data-fe-bind="name">Name</h3></article>
 *   </div>
 * data-fe-bind="field" sets the text; data-fe-bind-<attr>="field" sets an attribute.
 */
export const LIST_ATTR = 'data-fe-list'
export const PAGE_SIZE_ATTR = 'data-fe-page-size'
/** "scroll" = load more when scrolled to the end (default); "all" = show every row at once. */
export const LOAD_ATTR = 'data-fe-load'
export const BIND_ATTR = 'data-fe-bind'
export const BIND_PREFIX = 'data-fe-bind-'
/** On a list's card design: clicking a card calls this function with its row (React download). */
export const CALL_ATTR = 'data-fe-call'
/** Added to each card of an expanded list whose cards open a pop-up: its place in the data, so the pop-up can show that item. */
export const ITEM_ATTR = 'data-fe-item'
export const FROM_ATTR = 'data-fe-from'

export type ListInfo = { id: string; source: string; pageSize: number; load: 'scroll' | 'all'; templateId: string | null }

export const isListBox = (node: unknown): boolean => isElement(node as ElementNode) && LIST_ATTR in (node as ElementNode).attrs

/** The list box's settings and its card design (first element child). */
export function listInfo(nodes: NodeMap, id: string): ListInfo | null {
  const node = getElement(nodes, id)
  if (!node || !(LIST_ATTR in node.attrs)) return null
  const size = Number(node.attrs[PAGE_SIZE_ATTR])
  return {
    id,
    source: node.attrs[LIST_ATTR] ?? '',
    pageSize: Number.isFinite(size) && size > 0 ? Math.min(size, 100) : 6,
    load: node.attrs[LOAD_ATTR] === 'all' ? 'all' : 'scroll',
    templateId: node.children.find((child) => isElement(nodes[child])) ?? null,
  }
}

/** The list box an element is inside (its card design), or null. */
export function listAround(nodes: NodeMap, id: string | null): ListInfo | null {
  for (let current = nodes[id ?? '']?.parentId ?? null; current; current = nodes[current]?.parentId ?? null) {
    const info = listInfo(nodes, current)
    if (info) return info
  }
  return null
}

/** Which fields an element shows: { text?: field, src?: field, href?: field… }. */
export function bindingsOf(node: ElementNode): Record<string, string> {
  const bindings: Record<string, string> = {}
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name === BIND_ATTR) bindings.text = value
    else if (name.startsWith(BIND_PREFIX)) bindings[name.slice(BIND_PREFIX.length)] = value
  }
  return bindings
}

/**
 * What a binding shows for a row: a field's value, or — when it starts with "/" — an address
 * with the row's values put in ("/products/:id" -> "/products/3").
 */
export const resolveBinding = (spec: string, row: Record<string, DataValue>): string => (spec.startsWith('/') ? fillPath(spec, row) : showValue(row[spec]))

/** A value as page text ("true" -> "Yes"). */
export const showValue = (value: DataValue | undefined): string => (value === true ? 'Yes' : value === false ? 'No' : String(value ?? ''))

/** The rows a list shows when it is not live (Preview, downloads): all of them, or the first page. */
export function rowsFor(info: ListInfo, sources: DataSource[] | undefined): DataSource['rows'] {
  const source = (sources ?? []).find((item) => item.name === info.source)
  return source ? source.rows : []
}

/**
 * A ready-made card for a data source: the first picture, the first text as a
 * heading, then a long text and a number. Used by the "List from data" block.
 */
export function cardHtml(source: DataSource): string {
  const field = (...types: string[]) => source.fields.find((f) => types.includes(f.type))
  const image = field('image')
  const title = field('text')
  const body = field('longText')
  const number = field('number')
  return [
    '<article class="data-card" style="  border: 1px solid rgba(0,0,0,.08); border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 6px 18px rgba(0,0,0,.06)">',
    image ? `<img ${BIND_PREFIX}src="${image.name}" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" alt="" style="display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover">` : '',
    '<div style="padding: 16px 18px 20px">',
    title ? `<h3 ${BIND_ATTR}="${title.name}" style="margin: 0 0 6px; font-size: 18px">${title.name}</h3>` : '',
    body ? `<p ${BIND_ATTR}="${body.name}" style="margin: 0 0 10px; opacity: .75">${body.name}</p>` : '',
    number ? `<p ${BIND_ATTR}="${number.name}" style="margin: 0; font-weight: 700">${number.name}</p>` : '',
    '</div></article>',
  ].join('')
}

/** The whole "List from data" box: a responsive grid holding one card design. */
export const listBoxHtml = (source: DataSource) =>
  `<div class="data-list" ${LIST_ATTR}="${source.name}" ${PAGE_SIZE_ATTR}="6" ${LOAD_ATTR}="scroll" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; padding: 32px 24px; max-width: 1120px; margin: 0 auto">${cardHtml(source)}</div>`
