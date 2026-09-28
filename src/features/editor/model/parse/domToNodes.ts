import { createId } from '@/lib/ids'
import type { ElementNode, NodeMap } from '../types'
import { parseStyleText } from './parseStyle'
import { readAttributes } from './readHead'

/** Tags we never turn into editable nodes. */
const SKIPPED_TAGS = new Set(['script', 'style', 'link', 'meta', 'base', 'title'])

/**
 * Converts a DOM element (and everything inside it) into nodes, writing them
 * into `nodes`. Returns the new element's id.
 * Comments are dropped; text is kept exactly (spaces matter between links).
 */
export function elementToNodes(element: Element, parentId: string | null, nodes: NodeMap): string {
  const id = createId()
  const node: ElementNode = {
    id,
    kind: 'element',
    tag: element.tagName.toLowerCase(),
    parentId,
    attrs: readAttributes(element, ['style']),
    styles: {},
    children: [],
  }

  const inlineStyle = element.getAttribute('style')
  if (inlineStyle) node.styles.desktop = parseStyleText(inlineStyle)

  // <template> keeps its children in a separate fragment.
  const source = element instanceof HTMLTemplateElement ? element.content : element
  for (const child of source.childNodes) {
    const childId = childToNode(child, id, nodes)
    if (childId) node.children.push(childId)
  }

  nodes[id] = node
  return id
}

function childToNode(child: ChildNode, parentId: string, nodes: NodeMap): string | null {
  if (child.nodeType === Node.TEXT_NODE) {
    const id = createId()
    nodes[id] = { id, kind: 'text', parentId, text: child.textContent ?? '' }
    return id
  }
  if (child.nodeType !== Node.ELEMENT_NODE) return null

  const element = child as Element
  if (SKIPPED_TAGS.has(element.tagName.toLowerCase())) return null
  return elementToNodes(element, parentId, nodes)
}

/** Parses an HTML snippet (e.g. from the text editor) into nodes under `parentId`. */
export function htmlToChildNodes(html: string, parentId: string, nodes: NodeMap): string[] {
  // <template> content is inert: scripts never run and images never load here.
  const template = document.createElement('template')
  template.innerHTML = html
  const ids: string[] = []
  for (const child of template.content.childNodes) {
    const id = childToNode(child, parentId, nodes)
    if (id) ids.push(id)
  }
  return ids
}
