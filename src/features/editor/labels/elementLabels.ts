import { getTextContent } from '../model/tree/queries'
import type { ElementNode, NodeMap } from '../model/types'
import { labelForTag, type Label } from './tagLabels'

export { labelForTag }

/** Icon fonts (Font Awesome, Bootstrap Icons...) use <i class="fa ...">. */
function isIconFont(node: ElementNode): boolean {
  return /\b(fa|fas|far|fab|bi|material-icons|icon)[-\s]|\bfa\b/.test(node.attrs.class ?? '')
}

/** A link styled as a button (class "btn", "button", "cta"...) is a button to a normal person. */
function looksLikeButton(node: ElementNode): boolean {
  return node.tag === 'a' && /\b(btn|button|cta)\b/i.test(node.attrs.class ?? '')
}

/** Friendly name + icon for an element, looking at its tag and classes. */
export function labelForNode(node: ElementNode): Label {
  if (looksLikeButton(node)) return labelForTag('button')
  if (node.tag === 'i' && !isIconFont(node)) return labelForTag('em')
  return labelForTag(node.tag)
}

/** e.g. 'Button “Get started”' — what the layers list and the overlay tag show. */
export function describeNode(nodes: NodeMap, node: ElementNode, maxText = 24): string {
  const label = labelForNode(node)
  if (node.tag === 'body') return label.name
  if (node.tag === 'img') return node.attrs.alt ? `${label.name} “${node.attrs.alt.slice(0, maxText)}”` : label.name

  const text = getTextContent(nodes, node.id)
  if (!text) return label.name
  return `${label.name} “${text.length > maxText ? `${text.slice(0, maxText)}…` : text}”`
}
