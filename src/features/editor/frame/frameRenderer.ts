import { isSafeEditorAttribute } from '../model/scripts'
import type { ElementNode, NodeMap } from '../model/types'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Marks every rendered element so a click can be mapped back to its node. */
export const NODE_ATTR = 'data-fe-id'
const HIDDEN_ATTR = 'data-fe-hidden'

/**
 * Keeps the iframe's DOM in sync with the node map.
 * Only nodes whose object changed are touched, so typing in a text field
 * updates one element, not the whole page.
 */
export function createFrameRenderer(frameDoc: Document) {
  const domById = new Map<string, Node>()
  /** Nodes built during the current sync are already up to date. */
  const builtNow = new Set<string>()
  let previous: NodeMap = {}

  function createDom(nodes: NodeMap, id: string, parent: Element): Node | null {
    const node = nodes[id]
    if (!node) return null
    if (node.kind === 'text') {
      const text = frameDoc.createTextNode(node.text)
      domById.set(id, text)
      builtNow.add(id)
      return text
    }

    const inSvg = parent.namespaceURI === SVG_NS && parent.localName !== 'foreignObject'
    const element = node.tag === 'svg' || inSvg
      ? frameDoc.createElementNS(SVG_NS, node.tag)
      : frameDoc.createElement(node.tag)
    element.setAttribute(NODE_ATTR, id)
    domById.set(id, element)
    builtNow.add(id)
    patchElement(nodes, node, element, undefined)
    return element
  }

  function getDom(nodes: NodeMap, id: string, parent: Element): Node | null {
    return domById.get(id) ?? createDom(nodes, id, parent)
  }

  function patchElement(nodes: NodeMap, node: ElementNode, element: Element, old: ElementNode | undefined) {
    if (old?.attrs !== node.attrs) patchAttributes(element, old?.attrs ?? {}, node.attrs)
    if (Boolean(old?.hidden) !== Boolean(node.hidden)) element.toggleAttribute(HIDDEN_ATTR, Boolean(node.hidden))
    if (old?.children !== node.children) syncChildren(nodes, node, element)
  }

  function syncChildren(nodes: NodeMap, node: ElementNode, element: Element) {
    const wanted = node.children.map((id) => getDom(nodes, id, element)).filter((dom): dom is Node => dom !== null)
    const current = element.childNodes
    const same = current.length === wanted.length && wanted.every((dom, index) => current[index] === dom)
    if (!same) element.replaceChildren(...wanted)
  }

  /** A changed tag needs a new element; existing children are moved over. */
  function replaceTag(nodes: NodeMap, node: ElementNode, oldElement: Element) {
    domById.delete(node.id)
    const parent = oldElement.parentElement ?? frameDoc.body
    const fresh = createDom(nodes, node.id, parent)
    if (fresh) oldElement.replaceWith(fresh)
  }

  function patchNode(nodes: NodeMap, id: string) {
    const node = nodes[id]
    const dom = domById.get(id)
    if (!node || !dom) return // not on screen yet: its parent will create it
    const old = previous[id]

    if (node.kind === 'text') {
      if ((dom as Text).data !== node.text) (dom as Text).data = node.text
    } else if (old?.kind === 'element' && old.tag !== node.tag) {
      replaceTag(nodes, node, dom as Element)
    } else {
      patchElement(nodes, node, dom as Element, old?.kind === 'element' ? old : undefined)
    }
  }

  /** Call with the latest node map. Returns true if any element changed (styles may need rebuilding). */
  function sync(nodes: NodeMap, rootId: string): boolean {
    if (!domById.has(rootId)) {
      domById.set(rootId, frameDoc.body)
      frameDoc.body.setAttribute(NODE_ATTR, rootId)
    }
    let changed = false
    for (const id in nodes) {
      if (nodes[id] === previous[id]) continue
      changed = true
      if (!builtNow.has(id)) patchNode(nodes, id)
    }
    builtNow.clear()
    for (const id in previous) {
      if (nodes[id]) continue
      changed = true
      if (id !== rootId) (domById.get(id) as ChildNode | undefined)?.remove()
      domById.delete(id)
    }
    previous = nodes
    return changed
  }

  return { sync, getDom: (id: string) => domById.get(id) ?? null }
}

export type FrameRenderer = ReturnType<typeof createFrameRenderer>

function patchAttributes(element: Element, oldAttrs: Record<string, string>, newAttrs: Record<string, string>) {
  for (const name in oldAttrs) {
    if (!(name in newAttrs)) element.removeAttribute(name)
  }
  for (const [name, value] of Object.entries(newAttrs)) {
    if (oldAttrs[name] === value && element.hasAttribute(name)) continue
    try {
      if (isSafeEditorAttribute(name, value)) element.setAttribute(name, value)
    } catch {
      // Invalid attribute names from broken HTML are skipped, not fatal.
    }
  }
}
