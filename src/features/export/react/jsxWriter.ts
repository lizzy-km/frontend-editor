import { VOID_TAGS } from '@/features/editor/model/serialize/escape'
import { isElement, type ElementNode, type NodeMap } from '@/features/editor/model/types'
import { jsxAttr, jsxAttrName } from './jsxAttrs'

/** A run of repeated siblings written as one `{list.map(...)}` line. */
export type RepeatSlot = { ids: string[]; expression: string }

export type JsxContext = {
  nodes: NodeMap
  /** The class an element ends up with (its own + the export's edit class). */
  classFor: (node: ElementNode) => string | undefined
  /** Inside an item component: text id or `${elementId}@${attr}` -> prop name. */
  props?: Map<string, string>
  /** Repeated runs to replace, keyed by their first item's id. */
  repeats?: Map<string, RepeatSlot>
}

/** Tags that sit in a line of text: the space between two of them is visible. */
const INLINE_TAGS = new Set(['a', 'abbr', 'b', 'br', 'button', 'cite', 'code', 'em', 'i', 'img', 'input', 'kbd', 'label',
  'mark', 'q', 's', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'textarea', 'time', 'u', 'picture'])
const INDENT = '  '

const isBlank = (nodes: NodeMap, id: string) => nodes[id]?.kind === 'text' && !nodes[id].text.trim()
const isInline = (nodes: NodeMap, id: string | undefined) => Boolean(id && isElement(nodes[id]) && INLINE_TAGS.has(nodes[id].tag))

/** Children that are exported (hidden parts are left out, like in every download). */
export function visibleChildren(nodes: NodeMap, node: ElementNode): string[] {
  return node.children.filter((id) => nodes[id] && !(isElement(nodes[id]) && nodes[id].hidden))
}

/** Text as JSX: spaces collapsed like the browser does; {"…"} when it holds JSX-special characters. */
function textJsx(ctx: JsxContext, id: string, raw: boolean): string {
  const prop = ctx.props?.get(id)
  if (prop) return `{${prop}}`
  const node = ctx.nodes[id]
  const text = node?.kind === 'text' ? node.text : ''
  if (raw) return `{${JSON.stringify(text)}}`
  const collapsed = text.replace(/\s+/g, ' ')
  return /[{}<>]|&[#\w]+;/.test(collapsed) ? `{${JSON.stringify(collapsed)}}` : collapsed
}

/** <select> remembers its chosen <option> as defaultValue. */
function selectDefault(nodes: NodeMap, node: ElementNode): string | undefined {
  const option = node.children.map((id) => nodes[id]).find((child) => isElement(child) && 'selected' in child.attrs)
  if (!isElement(option)) return undefined
  const text = option.children.map((id) => (nodes[id]?.kind === 'text' ? nodes[id].text : '')).join('').trim()
  return option.attrs.value ?? text
}

function attrsJsx(ctx: JsxContext, node: ElementNode, inSvg: boolean): string {
  const attrs: Record<string, string> = { ...node.attrs }
  const className = ctx.classFor(node)
  if (className) attrs.class = className
  else delete attrs.class
  if (node.tag === 'select') {
    const chosen = selectDefault(ctx.nodes, node)
    if (chosen !== undefined) attrs.value = chosen
  }
  const propNames = [...(ctx.props?.keys() ?? [])].filter((key) => key.startsWith(`${node.id}@`)).map((key) => key.split('@')[1]!)
  const names = [...new Set([...Object.keys(attrs), ...propNames])]
  return names.map((name) => {
    const prop = ctx.props?.get(`${node.id}@${name}`)
    if (!prop) return jsxAttr(node.tag, name, attrs[name]!, inSvg)
    const jsxName = jsxAttrName(node.tag, name, inSvg)
    return jsxName ? ` ${jsxName}={${prop}}` : ''
  }).join('')
}

/** Children on one line (elements with text in them): keeps the spaces between words and tags. */
function inlineChildren(ctx: JsxContext, ids: string[], inSvg: boolean, raw: boolean): string {
  return ids.map((id) => {
    if (ctx.nodes[id]?.kind === 'text') return isBlank(ctx.nodes, id) && !raw ? ' ' : textJsx(ctx, id, raw)
    return writeElement(ctx, id, '', inSvg, raw)
  }).join('')
}

/** Children one per line. A space between two inline elements (buttons in a row) becomes {' '}. */
function blockChildren(ctx: JsxContext, ids: string[], pad: string, inSvg: boolean): string[] {
  const lines: string[] = []
  const skip = new Set<string>()
  ids.forEach((id, index) => {
    if (skip.has(id)) return
    const slot = ctx.repeats?.get(id)
    if (slot) {
      slot.ids.forEach((itemId) => skip.add(itemId))
      lines.push(`${pad}${slot.expression}`)
    } else if (isBlank(ctx.nodes, id)) {
      if (isInline(ctx.nodes, ids[index - 1]) && isInline(ctx.nodes, ids[index + 1]) && !skip.has(ids[index + 1]!)) lines.push(`${pad}{' '}`)
    } else {
      lines.push(writeElement(ctx, id, pad, inSvg))
    }
  })
  return lines
}

/** One element and everything inside it, as JSX, indented by `pad`. */
export function writeElement(ctx: JsxContext, id: string, pad: string, inSvg = false, inPre = false): string {
  const node = ctx.nodes[id]
  if (!isElement(node)) return ''
  const svg = inSvg || node.tag === 'svg'
  const childSvg = svg && node.tag !== 'foreignObject'
  const children = visibleChildren(ctx.nodes, node)
  if (node.tag === 'textarea') {
    const text = children.map((child) => (ctx.nodes[child]?.kind === 'text' ? (ctx.nodes[child] as { text: string }).text : '')).join('')
    const value = text ? ` defaultValue={${JSON.stringify(text)}}` : ''
    return `${pad}<textarea${attrsJsx(ctx, node, svg)}${value} />`
  }
  const open = `<${node.tag}${attrsJsx(ctx, node, svg)}`
  if (VOID_TAGS.has(node.tag) || children.length === 0) return `${pad}${open} />`
  const raw = inPre || node.tag === 'pre' // keep every space and line break
  const hasText = raw || children.some((child) => ctx.nodes[child]?.kind === 'text' && !isBlank(ctx.nodes, child))
  if (hasText) return `${pad}${open}>${inlineChildren(ctx, children, childSvg, raw)}</${node.tag}>`
  const lines = blockChildren(ctx, children, pad + INDENT, childSvg)
  return lines.length ? `${pad}${open}>\n${lines.join('\n')}\n${pad}</${node.tag}>` : `${pad}${open} />`
}

/** `<tag …attributes>` for an element whose children are written separately (App's <main>). */
export function openTag(ctx: JsxContext, node: ElementNode): string {
  return `<${node.tag}${attrsJsx(ctx, node, false)}>`
}
