import { isElement, type ElementNode, type NodeMap } from '../types'
import { getAncestorIds } from './queries'

/** Formatting the text editor (Quill) keeps as-is, as long as the tag carries nothing extra. */
const PLAIN_FORMATTING = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'br', 'sub', 'sup', 'code'])
const LINK_ATTRS = new Set(['href', 'target', 'rel', 'title'])

/** Tags that hold text even when they are empty. */
const TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a', 'button', 'span', 'label',
  'blockquote', 'figcaption', 'td', 'th', 'small', 'strong', 'em', 'dt', 'dd'])

const hasOwnStyles = (node: ElementNode) => Object.values(node.styles).some((styles) => styles && Object.keys(styles).length > 0)

/**
 * Would this child survive a round trip through Quill unchanged?
 * Quill rebuilds inline HTML from its own formats, so anything it can't
 * represent (a bare <span> styled as its own line, a class on a link, our own
 * per-element edits) would silently disappear.
 */
function survivesQuill(child: ElementNode): boolean {
  const attrs = Object.keys(child.attrs)
  if (hasOwnStyles(child)) return false
  if (PLAIN_FORMATTING.has(child.tag)) return attrs.length === 0
  if (child.tag === 'a') return attrs.every((name) => LINK_ATTRS.has(name))
  // Kept by the classSpan blot — only when the class is its only attribute.
  if (child.tag === 'span') return attrs.length === 1 && attrs[0] === 'class'
  return false
}

function onlySafeInside(nodes: NodeMap, id: string): boolean {
  const node = nodes[id]
  if (!isElement(node)) return true
  return node.children.every((childId) => {
    const child = nodes[childId]
    return !isElement(child) || (survivesQuill(child) && onlySafeInside(nodes, childId))
  })
}

function hasText(nodes: NodeMap, id: string): boolean {
  const node = nodes[id]
  if (!node) return false
  if (node.kind === 'text') return node.text.trim().length > 0
  return node.children.some((childId) => hasText(nodes, childId))
}

/** SVG can't display HTML formatting, so its text is edited as plain words only. */
function insideSvg(nodes: NodeMap, node: ElementNode): boolean {
  return node.tag === 'svg' || getAncestorIds(nodes, node.id).some((id) => (nodes[id] as ElementNode | undefined)?.tag === 'svg')
}

/**
 * Can this element's words be edited with the rich text editor?
 * Yes when everything inside is text or formatting Quill keeps exactly.
 * Otherwise the settings panel offers the "Words" list, which never touches formatting.
 */
export function isTextEditable(nodes: NodeMap, id: string): boolean {
  const node = nodes[id]
  if (!isElement(node) || node.tag === 'body' || insideSvg(nodes, node)) return false
  if (!onlySafeInside(nodes, id)) return false
  return hasText(nodes, id) || TEXT_TAGS.has(node.tag)
}

/** Every non-empty piece of text inside a node (for the "Words" list fallback). */
export function collectTextPieces(nodes: NodeMap, id: string): string[] {
  const node = nodes[id]
  if (!node) return []
  if (node.kind === 'text') return node.text.trim() ? [id] : []
  if (node.tag === 'script' || node.tag === 'style') return []
  return node.children.flatMap((childId) => collectTextPieces(nodes, childId))
}
