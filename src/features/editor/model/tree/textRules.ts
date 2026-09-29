import { isElement, type ElementNode, type NodeMap } from '../types'

/** Formatting tags the text editor (Quill) can keep. */
const INLINE_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'span', 'a', 'br', 'small', 'sup', 'sub', 'mark', 'code'])

/** Tags that hold text even when they are empty. */
const TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a', 'button', 'span', 'label',
  'blockquote', 'figcaption', 'td', 'th', 'small', 'strong', 'em', 'dt', 'dd'])

/** <i class="fa fa-star"> is an icon, not italic text — the text editor would destroy it. */
const isIcon = (node: ElementNode) => node.tag === 'i' && Boolean(node.attrs.class)

function onlyInlineInside(nodes: NodeMap, id: string): boolean {
  const node = nodes[id]
  if (!isElement(node)) return true
  return node.children.every((childId) => {
    const child = nodes[childId]
    if (!isElement(child)) return true
    return INLINE_TAGS.has(child.tag) && !isIcon(child) && onlyInlineInside(nodes, childId)
  })
}

function hasText(nodes: NodeMap, id: string): boolean {
  const node = nodes[id]
  if (!node) return false
  if (node.kind === 'text') return node.text.trim().length > 0
  return node.children.some((childId) => hasText(nodes, childId))
}

/**
 * Can this element's words be edited with the text editor?
 * Yes when it contains only text and simple formatting (no pictures, boxes, icons).
 */
export function isTextEditable(nodes: NodeMap, id: string): boolean {
  const node = nodes[id]
  if (!isElement(node) || node.tag === 'body') return false
  if (!onlyInlineInside(nodes, id)) return false
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
