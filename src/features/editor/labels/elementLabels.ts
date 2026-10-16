import { getTextContent } from '../model/tree/queries'
import { LIST_ATTR, listInfo } from '../model/dataLists'
import { RECORD_ATTR } from '../model/dataRecords'
import { isPageNode, TITLE_ATTR } from '../model/pages'
import { COMPONENT_ATTR, INSTANCE_ATTR, mainOf } from '../model/reuse/attrs'
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
  if (isPageNode(node)) return { name: 'Page', icon: 'layers' }
  if (LIST_ATTR in node.attrs) return { name: 'List from data', icon: 'layers' }
  if (RECORD_ATTR in node.attrs) return { name: 'Data box', icon: 'box' }
  if (looksLikeButton(node)) return labelForTag('button')
  if (node.tag === 'i' && !isIconFont(node)) return labelForTag('em')
  return labelForTag(node.tag)
}

/** e.g. 'Button “Get started”' — what the layers list and the overlay tag show. */
export function describeNode(nodes: NodeMap, node: ElementNode, maxText = 24): string {
  const label = labelForNode(node)
  if (node.tag === 'body') return label.name
  if (COMPONENT_ATTR in node.attrs) return `Component “${node.attrs[COMPONENT_ATTR]}”`
  if (INSTANCE_ATTR in node.attrs) return `Copy of “${mainOf(nodes, node)?.attrs[COMPONENT_ATTR] ?? 'a component'}”`
  if (isPageNode(node)) return `Page “${node.attrs[TITLE_ATTR] ?? ''}”`
  if (listInfo(nodes, node.parentId ?? '')?.templateId === node.id) return `${label.name} (card design)`
  if (listInfo(nodes, node.id)) return `List from data “${node.attrs[LIST_ATTR]}”`
  if (RECORD_ATTR in node.attrs) return `Data box “${node.attrs[RECORD_ATTR]}”`
  if (node.tag === 'img') return node.attrs.alt ? `${label.name} “${node.attrs.alt.slice(0, maxText)}”` : label.name

  const text = getTextContent(nodes, node.id)
  if (!text) return label.name
  return `${label.name} “${text.length > maxText ? `${text.slice(0, maxText)}…` : text}”`
}
