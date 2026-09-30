import { isElement, type ElementNode, type NodeMap } from '../types'
import { stringifyStyle } from '../parse/parseStyle'
import { escapeAttr, escapeText, VOID_TAGS } from './escape'

/** Marks a hidden element in HTML shown for editing, so it stays hidden when re-applied. */
export const HIDDEN_MARK = 'data-fe-hidden'

export type HtmlOptions = {
  /** Extra class added to an element (the exporter uses this for style rules). */
  extraClass?: (node: ElementNode) => string | undefined
  /**
   * HTML for the "edit code" views: Computer-view edits become style="…",
   * and hidden elements are kept (marked) instead of left out.
   */
  forEditing?: boolean
}

function hasStyles(node: ElementNode): boolean {
  return Object.values(node.styles).some((styles) => styles && Object.keys(styles).length > 0)
}

/** The class the exporter gives every element the user styled. */
export const styleClassFor = (node: ElementNode) => (hasStyles(node) ? `fe-${node.id}` : undefined)

function attributesToHtml(node: ElementNode, options: HtmlOptions): string {
  const attrs = { ...node.attrs }
  if (options.forEditing) {
    const desktop = node.styles.desktop
    if (desktop && Object.keys(desktop).length > 0) attrs.style = stringifyStyle(desktop)
    if (node.hidden) attrs[HIDDEN_MARK] = ''
  }
  const extra = options.extraClass?.(node)
  if (extra) attrs.class = attrs.class ? `${attrs.class} ${extra}` : extra

  return Object.entries(attrs)
    .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${escapeAttr(value)}"`))
    .join('')
}

/** Serializes a node and its children to HTML. Hidden nodes are left out (unless forEditing). */
export function nodeToHtml(nodes: NodeMap, id: string, options: HtmlOptions = {}): string {
  const node = nodes[id]
  if (!node) return ''
  if (node.kind === 'text') {
    const parent = nodes[node.parentId ?? '']
    // Text inside <script>/<style> in the body must stay raw.
    const raw = isElement(parent) && (parent.tag === 'script' || parent.tag === 'style')
    return raw ? node.text : escapeText(node.text)
  }
  if (node.hidden && !options.forEditing) return ''

  const open = `<${node.tag}${attributesToHtml(node, options)}>`
  if (VOID_TAGS.has(node.tag)) return open
  return `${open}${childrenToHtml(nodes, node, options)}</${node.tag}>`
}

export function childrenToHtml(nodes: NodeMap, node: ElementNode, options: HtmlOptions = {}): string {
  return node.children.map((childId) => nodeToHtml(nodes, childId, options)).join('')
}
