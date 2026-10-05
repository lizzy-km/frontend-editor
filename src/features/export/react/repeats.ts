import { isElement, type ElementNode, type NodeMap } from '@/features/editor/model/types'
import { BOOLEAN_ATTRS } from './jsxAttrs'
import { visibleChildren } from './jsxWriter'
import { createPropNames, describeName, meaningfulName, pascalCase } from './names'

export type PropValue = string | boolean | undefined
export type PropSpec = { name: string; kind: 'string' | 'boolean'; optional: boolean }

/** Siblings with the same structure (cards, menu items, reviews) that become one component + a data list. */
export type RepeatGroup = {
  ids: string[]
  /** Suggested component name (made unique later). */
  baseName: string
  props: PropSpec[]
  /** In the first item: text id or `${elementId}@${attr}` -> prop name. */
  fields: Map<string, string>
  rows: Record<string, PropValue>[]
}

type ClassFor = (node: ElementNode) => string | undefined

const isBlankText = (nodes: NodeMap, id: string) => nodes[id]?.kind === 'text' && !nodes[id].text.trim()
/** Elements and real text; spacing-only text is ignored when comparing. */
const significant = (nodes: NodeMap, node: ElementNode) => visibleChildren(nodes, node).filter((id) => !isBlankText(nodes, id))

/** The shape of an element: tags, classes and where text sits — not the words or addresses. */
function signature(nodes: NodeMap, id: string): string {
  const node = nodes[id]
  if (!isElement(node)) return 't'
  return `${node.tag}.${node.attrs.class ?? ''}(${significant(nodes, node).map((child) => signature(nodes, child)).join(',')})`
}

function textPropName(nodes: NodeMap, parentId: string | null): string {
  const parent = parentId ? nodes[parentId] : undefined
  if (!isElement(parent)) return 'text'
  if (/^h[1-6]$/.test(parent.tag)) return 'title'
  if (parent.tag === 'p') return 'text'
  if (parent.tag === 'a' || parent.tag === 'button') return 'label'
  if (parent.tag === 'li') return 'item'
  const name = describeName(parent)
  return name ? name.charAt(0).toLowerCase() + name.slice(1) : 'text'
}

function attrPropName(tag: string, attr: string): string {
  if (attr === 'src') return tag === 'img' ? 'image' : `${tag}Src`
  if (attr === 'alt') return 'imageAlt'
  if (attr === 'href') return 'link'
  if (attr === 'class') return 'className'
  if (attr === 'datetime') return 'date'
  const name = pascalCase(attr)
  return name.charAt(0).toLowerCase() + name.slice(1)
}

/** Walks all items side by side and turns every value that differs into a prop. */
function collectFields(nodes: NodeMap, classFor: ClassFor, ids: string[]): Omit<RepeatGroup, 'ids' | 'baseName'> {
  const fields = new Map<string, string>()
  const props: PropSpec[] = []
  const rows: Record<string, PropValue>[] = ids.map(() => ({}))
  const propName = createPropNames()
  const add = (key: string, wanted: string, kind: PropSpec['kind'], values: PropValue[]) => {
    const name = propName(wanted)
    fields.set(key, name)
    props.push({ name, kind, optional: values.some((value) => value === undefined) })
    values.forEach((value, index) => { rows[index]![name] = value })
  }
  const walk = (position: string[]) => {
    const first = nodes[position[0]!]!
    if (first.kind === 'text') {
      const values = position.map((id) => (nodes[id] as { text: string }).text.replace(/\s+/g, ' '))
      if (new Set(values).size > 1) add(first.id, textPropName(nodes, first.parentId), 'string', values)
      return
    }
    const elements = position.map((id) => nodes[id] as ElementNode)
    const attrValue = (node: ElementNode, name: string) => (name === 'class' ? classFor(node) : node.attrs[name])
    const names = new Set(elements.flatMap((node) => [...Object.keys(node.attrs), ...(classFor(node) ? ['class'] : [])]))
    for (const name of names) {
      if (name.startsWith('on') || name === 'selected' || name === 'style') continue // not props (handlers stay as written)
      const values = elements.map((node) => attrValue(node, name))
      if (new Set(values).size <= 1) continue
      const boolean = BOOLEAN_ATTRS.has(name)
      add(`${first.id}@${name}`, attrPropName(first.tag, name), boolean ? 'boolean' : 'string',
        boolean ? values.map((value) => value !== undefined) : values)
    }
    const childLists = elements.map((node) => significant(nodes, node))
    childLists[0]!.forEach((_, index) => walk(childLists.map((list) => list[index]!)))
  }
  walk(ids)
  return { fields, props, rows }
}

/** Tags that can be an "item" (a card, a menu entry, a review); links and spans only with structure inside. */
const ITEM_TAGS = new Set(['div', 'article', 'li', 'figure', 'section', 'blockquote', 'details', 'tr', 'aside', 'a', 'label', 'dl'])

/** Is a run worth a component? Items with something inside (not plain text), three or more, or two with real structure. */
function worthGrouping(nodes: NodeMap, ids: string[]): boolean {
  const first = nodes[ids[0]!] as ElementNode
  const inside = significant(nodes, first)
  const hasStructure = inside.some((id) => isElement(nodes[id]))
  if (!ITEM_TAGS.has(first.tag) || !hasStructure) return false
  return ids.length >= 3 || (ids.length === 2 && inside.length >= 2)
}

/** "Card" from the item's class; class-less items are named after their list ("ScheduleItem"). */
function itemName(nodes: NodeMap, first: ElementNode, rootId: string): string {
  const own = meaningfulName(first)
  if (own) return own
  for (let id = first.parentId; id; id = nodes[id]?.parentId ?? null) {
    const parent = nodes[id]
    const name = isElement(parent) ? meaningfulName(parent) : null
    if (name) return `${name}Item`
    if (id === rootId) break
  }
  return `${describeName(nodes[rootId] as ElementNode)}Item`
}

/** Finds repeated item groups inside one component (items themselves are not searched again). */
export function findRepeats(nodes: NodeMap, rootId: string, classFor: ClassFor): RepeatGroup[] {
  const groups: RepeatGroup[] = []
  const visit = (id: string) => {
    const node = nodes[id]
    if (!isElement(node) || node.tag === 'svg') return // drawings are left as they are
    const children = significant(nodes, node)
    if (children.some((child) => nodes[child]?.kind === 'text')) return // a line of text, not a list
    let index = 0
    while (index < children.length) {
      const shape = signature(nodes, children[index]!)
      let end = index + 1
      while (end < children.length && signature(nodes, children[end]!) === shape) end++
      const run = children.slice(index, end)
      const found = worthGrouping(nodes, run) ? collectFields(nodes, classFor, run) : null
      if (found && found.props.length > 0) groups.push({ ids: run, baseName: itemName(nodes, nodes[run[0]!] as ElementNode, rootId), ...found })
      else run.forEach(visit)
      index = end
    }
  }
  visit(rootId)
  return groups
}
