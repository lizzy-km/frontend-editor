import { createId } from '@/lib/ids'
import { collectSubtreeIds } from '@/features/editor/model/tree/queries'
import { isElement, type ElementNode, type NodeMap, type PageDoc, type TextNode } from '@/features/editor/model/types'
import { htmlAttrName, isBooleanAttr } from './attrNames'
import { parseJsx, type JsxChild, type JsxElement } from './jsxParse'

/** The page elements another component was made from (a form, a card, a list): kept as they are when markup is edited. */
export type ComponentRef = { name: string; ids: string[] }
export type ApplyResult = { ok: true; doc: PageDoc } | { ok: false; error: string; line: number }

/** The JSX of a generated component file: what is between `return (` and the closing `)`. */
export function extractMarkup(code: string): string | null {
  const start = code.indexOf('\n  return (\n')
  const end = code.lastIndexOf('\n  )\n}')
  return start < 0 || end < start ? null : code.slice(start + '\n  return (\n'.length, end)
}

/** Why a component can't be edited as markup (null: it can). */
export function editBlocker(code: string): string | null {
  const markup = extractMarkup(code)
  if (markup === null) return 'This file has no markup to edit.'
  if (markup.trimStart().startsWith('<>')) return 'This file only puts other components together. Open one of them to edit its markup.'
  const parsed = parseJsx(markup)
  return parsed.ok ? null : parsed.error
}

const collapse = (text: string) => text.replace(/\s+/g, ' ').trim()
const htmlTag = (tag: string) => (tag === 'Link' || tag === 'NavLink' ? 'a' : tag)

type Slot = { key: string; ids: string[] }

class Fail extends Error {
  constructor(message: string) { super(message) }
}

class Applier {
  nodes: NodeMap
  private claimed = new Map<string, ComponentRef>()
  private byName = new Map<string, ComponentRef>()

  constructor(doc: PageDoc, others: ComponentRef[]) {
    this.nodes = { ...doc.nodes }
    for (const other of others) {
      this.byName.set(other.name, other)
      for (const id of other.ids) this.claimed.set(id, other)
    }
  }

  /** The old children as slots: a component's elements count as one. Hidden ones stay out of the way. */
  private slots(node: ElementNode): { slots: Slot[]; hidden: string[] } {
    const slots: Slot[] = []
    const hidden: string[] = []
    const seen = new Set<string>()
    for (const id of node.children) {
      const child = this.nodes[id]
      const component = this.claimed.get(id)
      if (!child || seen.has(id)) continue
      if (component) { component.ids.forEach((each) => seen.add(each)); slots.push({ key: `@${component.name}`, ids: component.ids.filter((each) => node.children.includes(each)) }); continue }
      if (isElement(child) && child.hidden) hidden.push(id)
      else slots.push({ key: isElement(child) ? child.tag : '#text', ids: [id] })
    }
    return { slots, hidden }
  }

  private attrs(jsx: JsxElement, old: ElementNode | undefined): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [name, value] of Object.entries(jsx.attrs)) {
      const key = htmlTag(jsx.tag) === 'a' && name === 'to' ? 'href' : htmlAttrName(name, jsx.tag)
      if (jsx.tag === 'select' && key === 'value') continue // the chosen <option> carries it
      if (key === 'class') {
        const tokens = String(value).split(/\s+/).filter((token) => token && !(token.startsWith('fe-') && this.nodes[token.slice(3)]))
        if (tokens.length) out.class = tokens.join(' ')
      } else if (value === true || isBooleanAttr(key)) out[key] = old?.attrs[key] ?? (value === true ? '' : String(value))
      else out[key] = String(value)
    }
    // What the code can't show stays: the editor's own markers.
    for (const [name, value] of Object.entries(old?.attrs ?? {})) if (name.startsWith('data-fe-') && !(name in out)) out[name] = value
    return out
  }

  private create(jsx: JsxChild, parentId: string, svg: boolean): string {
    if (jsx.kind === 'opaque') throw new Fail(`<${jsx.name} /> can't be added here: it is made from page elements. Copy them in the editor instead.`)
    const id = createId()
    if (jsx.kind === 'text') {
      this.nodes[id] = { id, kind: 'text', parentId, text: jsx.text } satisfies TextNode
      return id
    }
    const tag = htmlTag(jsx.tag)
    if (/[A-Z]/.test(tag)) throw new Fail(`<${jsx.tag}> isn't an HTML tag.`)
    const node: ElementNode = { id, kind: 'element', tag, parentId, attrs: this.attrs(jsx, undefined), styles: {}, children: [] }
    this.nodes[id] = node
    node.children = this.childrenOf(jsx).map((child) => this.create(child, id, svg || tag === 'svg'))
    return id
  }

  private childrenOf(jsx: JsxElement): JsxChild[] {
    const content = jsx.tag === 'textarea' ? jsx.attrs.defaultValue : undefined
    return typeof content === 'string' ? [{ kind: 'text', text: content }] : jsx.children
  }

  /** Matches old and new children by kind, in order (longest common run), so inserting something doesn't recreate the rest. */
  private align(old: Slot[], next: string[]): Map<number, number> {
    const table = Array.from({ length: old.length + 1 }, () => new Array<number>(next.length + 1).fill(0))
    for (let i = old.length - 1; i >= 0; i--) for (let j = next.length - 1; j >= 0; j--) {
      table[i]![j] = old[i]!.key === next[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!)
    }
    const pairs = new Map<number, number>()
    for (let i = 0, j = 0; i < old.length && j < next.length;) {
      if (old[i]!.key === next[j]) pairs.set(j++, i++)
      else if (table[i + 1]![j]! >= table[i]![j + 1]!) i++
      else j++
    }
    return pairs
  }

  reconcile(id: string, jsx: JsxElement, svg: boolean): void {
    const node = this.nodes[id] as ElementNode
    const inSvg = svg || node.tag === 'svg'
    const next = this.childrenOf(jsx)
    const { slots, hidden } = this.slots(node)
    const keys = next.map((child) => (child.kind === 'element' ? htmlTag(child.tag) : child.kind === 'text' ? '#text' : `@${child.name}`))
    const pairs = this.align(slots, keys)
    const used = new Set<number>()
    const children: string[] = []
    next.forEach((child, index) => {
      const at = pairs.get(index)
      if (at === undefined) { children.push(this.create(child, id, inSvg)); return }
      used.add(at)
      const slot = slots[at]!
      children.push(...slot.ids)
      const old = this.nodes[slot.ids[0]!]
      if (child.kind === 'element') this.reconcile(slot.ids[0]!, child, inSvg)
      else if (child.kind === 'text' && old?.kind === 'text' && collapse(old.text) !== collapse(child.text)) this.nodes[old.id] = { ...old, text: child.text }
    })
    slots.forEach((slot, index) => { if (!used.has(index)) for (const gone of slot.ids) for (const sub of collectSubtreeIds(this.nodes, gone)) delete this.nodes[sub] })
    this.nodes[id] = { ...node, tag: htmlTag(jsx.tag), attrs: this.attrs(jsx, node), children: [...children, ...hidden] }
  }
}

/** Applies edited markup to the element a component was made from: same elements keep their id and styles. */
export function applyMarkup(doc: PageDoc, rootId: string, markup: string, others: ComponentRef[]): ApplyResult {
  const parsed = parseJsx(markup)
  if (!parsed.ok) return parsed
  const root = doc.nodes[rootId]
  if (!isElement(root)) return { ok: false, error: 'The element this code was made from is gone.', line: 1 }
  if (htmlTag(parsed.root.tag) !== root.tag) return { ok: false, error: `The outer tag must stay <${root.tag}>.`, line: 1 }
  try {
    const applier = new Applier(doc, others.filter((other) => !other.ids.includes(rootId)))
    applier.reconcile(rootId, parsed.root, false)
    return { ok: true, doc: { ...doc, nodes: applier.nodes } }
  } catch (error) {
    if (!(error instanceof Fail)) throw error
    return { ok: false, error: error.message, line: 1 }
  }
}
