import { VOID_TAGS } from '@/features/editor/model/serialize/escape'
import { isElement, type ElementNode, type FieldType, type NodeMap } from '@/features/editor/model/types'
import { BIND_ATTR, BIND_PREFIX } from '@/features/editor/model/dataLists'
import { GO_ATTR } from '@/features/editor/model/pages'
import { attrTag, jsxAttr, jsxAttrName } from './jsxAttrs'
import { formAttrs, formHandlesAttr, withFormExtras, type FormSlot } from './forms/formJsx'
import { asRouterLink, fieldExpression, isEditorAttr, motionFor, showWhen, type MotionState, type ShowState } from './jsxExtras'
import { clickAttrs, modalNode } from './popups/jsxPopups'

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
  /**
   * Sites: links to these page addresses become the router's <Link to> (`used`), and "click goes to"
   * boxes call navigate (`navigate`); both tell the file what to import. `go` writes the navigate call.
   */
  links?: { paths: Set<string>; used: boolean; navigate: boolean; go: (target: string, typed: boolean) => string }
  /** "List from data" boxes written as their list component instead: box id -> component name. */
  lists?: Map<string, string>
  /** Inside a list's card component: the row's fields and their kinds (bindings become props). */
  row?: Map<string, FieldType>
  /** Animated elements (Motion): what the file used. */
  motion?: MotionState
  /** "Who can see this": elements wrapped in <Show>; `used` tells the file to import it. */
  show?: ShowState
  /** Forms written as their own component instead: form id -> component name. */
  forms?: Map<string, string>
  /** Inside a form component: its fields register with React Hook Form. */
  form?: FormSlot
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

/** "Click goes to": the page address (a prop inside list items). */
const goTarget = (ctx: JsxContext, node: ElementNode) =>
  (GO_ATTR in node.attrs ? { value: ctx.props?.get(`${node.id}@${GO_ATTR}`) ?? JSON.stringify(node.attrs[GO_ATTR]), typed: !ctx.props?.has(`${node.id}@${GO_ATTR}`) } : undefined)

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
  // In a list card, data-fe-bind-src="image" replaces the designed src with the row's value.
  const fromRow = Object.keys(attrs).filter((name) => ctx.row && name.startsWith(BIND_PREFIX)).map((name) => {
    const attr = name.slice(BIND_PREFIX.length)
    const value = fieldExpression(ctx, attrs[name]!, false)
    delete attrs[attr]
    const jsxName = jsxAttrName(attrTag(node.tag, node.attrs.type), attr, inSvg)
    return value && jsxName ? ` ${jsxName}={${value}}` : ''
  })
  const names = [...new Set([...Object.keys(attrs), ...propNames])].filter((name) => !isEditorAttr(name) && !formHandlesAttr(ctx, node.id, name))
  return fromRow.join('') + names.map((name) => {
    const prop = ctx.props?.get(`${node.id}@${name}`)
    if (name === GO_ATTR) return ''
    if (!prop) return jsxAttr(attrTag(node.tag, node.attrs.type), name, attrs[name]!, inSvg)
    const jsxName = jsxAttrName(attrTag(node.tag, node.attrs.type), name, inSvg)
    return jsxName ? ` ${jsxName}={${prop}}` : ''
  }).join('') + clickAttrs(ctx, node, goTarget(ctx, node)) + formAttrs(ctx, node.id)
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

/** One element and everything inside it, as JSX, indented by `pad` (wrapped in <Show> when only some visitors see it). */
export function writeElement(ctx: JsxContext, id: string, pad: string, inSvg = false, inPre = false): string {
  const node = ctx.nodes[id]
  const when = ctx.show && isElement(node) ? showWhen(node) : null
  const one = (at: string) => withFormExtras(ctx, id, writeOne(ctx, id, at, inSvg, inPre), at)
  if (!when) return one(pad)
  ctx.show!.used = true
  if (!pad) return `<Show when=${when}>${one('')}</Show>`
  return `${pad}<Show when=${when}>\n${one(pad + INDENT)}\n${pad}</Show>`
}

function writeOne(ctx: JsxContext, id: string, pad: string, inSvg = false, inPre = false): string {
  const original = ctx.nodes[id]
  if (!isElement(original)) return ''
  const list = ctx.lists?.get(id) ?? ctx.forms?.get(id)
  if (list) return `${pad}<${list} />`
  const node = modalNode(ctx, asRouterLink(ctx, original))
  const { tag, extra } = motionFor(ctx, node)
  const bound = ctx.row && node.attrs[BIND_ATTR] ? fieldExpression(ctx, node.attrs[BIND_ATTR], true) : null
  if (bound) return `${pad}<${tag}${attrsJsx(ctx, node, inSvg)}${extra}>{${bound}}</${tag}>`
  const svg = inSvg || node.tag === 'svg'
  const childSvg = svg && node.tag !== 'foreignObject'
  const children = visibleChildren(ctx.nodes, node)
  if (node.tag === 'textarea') {
    const text = children.map((child) => (ctx.nodes[child]?.kind === 'text' ? (ctx.nodes[child] as { text: string }).text : '')).join('')
    const value = text ? ` defaultValue={${JSON.stringify(text)}}` : ''
    return `${pad}<${tag}${attrsJsx(ctx, node, svg)}${extra}${value} />`
  }
  const open = `<${tag}${attrsJsx(ctx, node, svg)}${extra}`
  if (VOID_TAGS.has(node.tag) || children.length === 0) return `${pad}${open} />`
  const raw = inPre || node.tag === 'pre' // keep every space and line break
  const hasText = raw || children.some((child) => ctx.nodes[child]?.kind === 'text' && !isBlank(ctx.nodes, child))
  if (hasText) return `${pad}${open}>${inlineChildren(ctx, children, childSvg, raw)}</${tag}>`
  const lines = blockChildren(ctx, children, pad + INDENT, childSvg)
  return lines.length ? `${pad}${open}>\n${lines.join('\n')}\n${pad}</${tag}>` : `${pad}${open} />`
}

/** `<tag …attributes>` for an element whose children are written separately (App's <main>). */
export function openTag(ctx: JsxContext, node: ElementNode): string {
  const { tag, extra } = motionFor(ctx, node)
  return `<${tag}${attrsJsx(ctx, node, false)}${extra}>`
}

/** The closing tag matching openTag (motion.<tag> when animated). */
export function closeTag(ctx: JsxContext, node: ElementNode): string {
  const animated = Boolean(ctx.motion) && node.tag !== 'Link' && node.tag !== 'Modal' && (ctx.motion!.items.has(node.id) || Boolean(node.attrs['data-fe-animate']))
  return `</${animated ? `motion.${node.tag}` : node.tag}>`
}
