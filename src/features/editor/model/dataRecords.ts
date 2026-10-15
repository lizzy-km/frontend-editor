import { BIND_ATTR, BIND_PREFIX, LIST_ATTR, LOAD_ATTR, PAGE_SIZE_ATTR, listInfo } from './dataLists'
import { getElement, collectSubtreeIds, getTextContent } from './tree/queries'
import { isElement, type DataSource, type DataValue, type ElementNode, type FieldType, type NodeMap } from './types'

/**
 * Wiring data to any box. A box shows a data source in one of two ways:
 *   every row:  <div data-fe-list="products">…one card design…</div>        (see dataLists.ts)
 *   one record: <section data-fe-record="products" data-fe-row="first">…</section>
 * Inside, elements show fields with data-fe-bind="field" (text) and data-fe-bind-<attr>="field".
 * data-fe-row picks the record: "first", a row number ("3"), "?id": the row whose id is in the page address (?id=3),
 * or "clicked" (a pop-up): the item of the card that opened it.
 */
export const RECORD_ATTR = 'data-fe-record'
export const ROW_ATTR = 'data-fe-row'

/** `clicked`: a pop-up shows the card that opened it (the first item when opened any other way). */
export type RowChoice = { kind: 'first' } | { kind: 'number'; n: number } | { kind: 'param'; name: string } | { kind: 'clicked' }
export type RecordInfo = { id: string; source: string; row: RowChoice }
/** How a box shows its data (null = it doesn't). */
export type DataBox = { id: string; mode: 'list' | 'record'; source: string }

export const isRecordBox = (node: unknown): node is ElementNode => isElement(node as ElementNode) && RECORD_ATTR in (node as ElementNode).attrs

export function rowChoiceOf(value: string | undefined): RowChoice {
  if (value === 'clicked') return { kind: 'clicked' }
  if (value?.startsWith('?') && value.length > 1) return { kind: 'param', name: value.slice(1) }
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? { kind: 'number', n } : { kind: 'first' }
}

export const rowChoiceAttr = (choice: RowChoice) => (choice.kind === 'param' ? `?${choice.name}` : choice.kind === 'number' ? String(choice.n) : choice.kind === 'clicked' ? 'clicked' : 'first')

export function recordInfo(nodes: NodeMap, id: string): RecordInfo | null {
  const node = getElement(nodes, id)
  if (!node || !(RECORD_ATTR in node.attrs)) return null
  return { id, source: node.attrs[RECORD_ATTR] ?? '', row: rowChoiceOf(node.attrs[ROW_ATTR]) }
}

/** The data a box shows, and how (list or record). */
export function dataBoxOf(nodes: NodeMap, id: string): DataBox | null {
  const list = listInfo(nodes, id)
  if (list) return { id, mode: 'list', source: list.source }
  const record = recordInfo(nodes, id)
  return record ? { id, mode: 'record', source: record.source } : null
}

/** The data box an element is inside (a list's card design or a record), or null. */
export function dataAround(nodes: NodeMap, id: string | null): DataBox | null {
  for (let current = nodes[id ?? '']?.parentId ?? null; current; current = nodes[current]?.parentId ?? null) {
    const box = dataBoxOf(nodes, current)
    if (box) return box
  }
  return null
}

/** The row a record shows. `param` is the value in the page address (null when absent). A missing match falls back to the first row. */
export function pickRow(rows: DataSource['rows'], choice: RowChoice, param: string | null = null): Record<string, DataValue> | undefined {
  if (choice.kind === 'number') return rows[choice.n - 1] ?? rows[0]
  if (choice.kind === 'param' && param !== null) return rows.find((row) => String(row.id ?? '') === param) ?? rows[0]
  return rows[0]
}

const INLINE = new Set(['b', 'i', 'em', 'strong', 'span', 'small', 'u', 'br', 'mark', 'code', 'sub', 'sup'])

/** The parts of a data box that can show a field: pictures and short pieces of text (headings, paragraphs, links…). */
export function bindableParts(nodes: NodeMap, boxId: string): ElementNode[] {
  const box = getElement(nodes, boxId)
  if (!box) return []
  const info = listInfo(nodes, boxId)
  const top = info ? info.templateId : boxId
  if (!top) return []
  const parts: ElementNode[] = []
  for (const id of collectSubtreeIds(nodes, top)) {
    const node = getElement(nodes, id)
    if (!node || node.hidden || (id !== boxId && dataBoxOf(nodes, id))) continue
    const plain = node.children.every((child) => nodes[child]?.kind === 'text' || (isElement(nodes[child]) && INLINE.has((nodes[child] as ElementNode).tag)))
    // A bold word inside a paragraph is part of the paragraph.
    if (parts.some((part) => part.id === node.parentId)) continue
    if (node.tag === 'img' || (id !== boxId && plain && getTextContent(nodes, id))) parts.push(node)
  }
  return parts
}

const TEXTY: FieldType[] = ['text', 'longText', 'number', 'boolean', 'date', 'url']

/** The field types a part can show: pictures take picture links, text takes anything readable. */
export const fieldTypesFor = (attr: string): FieldType[] =>
  (attr === 'src' ? ['image', 'url'] : attr === 'href' ? ['url', 'text'] : TEXTY)

/** Connects fields to parts for the person: pictures get picture fields, headings text fields, paragraphs long text, and so on. */
export function autoWire(nodes: NodeMap, boxId: string, source: DataSource): NodeMap {
  const used = new Set<string>()
  const next: NodeMap = { ...nodes }
  const take = (types: FieldType[]) => {
    const field = types.map((type) => source.fields.find((item) => item.type === type && !used.has(item.name))).find(Boolean)
    if (field) used.add(field.name)
    return field?.name
  }
  for (const part of bindableParts(nodes, boxId)) {
    const attrs = { ...part.attrs }
    if (part.tag === 'img') {
      const field = take(['image', 'url'])
      if (field) attrs[`${BIND_PREFIX}src`] = field
    } else {
      const heading = /^h[1-6]$/.test(part.tag)
      const field = take(heading ? ['text'] : part.tag === 'p' ? ['longText', 'text'] : part.tag === 'a' ? ['text', 'url'] : ['number', 'date', 'text', 'longText'])
      if (field) attrs[BIND_ATTR] = field
    }
    next[part.id] = { ...part, attrs }
  }
  return next
}

/** The attributes that make a box show (or stop showing) data. One call = one undo step (setAttributes). */
export function wiringAttrs(mode: 'list' | 'record' | null, source: string, row: RowChoice = { kind: 'first' }, current: ElementNode): Record<string, string> {
  const clear = { [LIST_ATTR]: '', [PAGE_SIZE_ATTR]: '', [LOAD_ATTR]: '', [RECORD_ATTR]: '', [ROW_ATTR]: '' }
  if (mode === null || !source) return clear
  if (mode === 'list') return { ...clear, [LIST_ATTR]: source, [PAGE_SIZE_ATTR]: current.attrs[PAGE_SIZE_ATTR] ?? '6', [LOAD_ATTR]: current.attrs[LOAD_ATTR] ?? 'scroll' }
  return { ...clear, [RECORD_ATTR]: source, [ROW_ATTR]: rowChoiceAttr(row) }
}
