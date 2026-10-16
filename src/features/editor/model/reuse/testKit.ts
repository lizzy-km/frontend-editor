import { getDoc, useDocStore } from '../../store/doc.store'
import { parseHtmlDocument } from '../parse/parseDocument'
import { getTextContent } from '../tree/queries'
import { insertSubtree, patchNode } from '../tree/treeOps'
import { isElement, type ElementNode, type NodeMap, type TextNode } from '../types'
import { instancesOf } from './attrs'
import { instantiate, makeComponent } from './make'

/** Shared by the reusable-component tests: a page with a main component "Card" and two copies, and small helpers. */
export const HTML = '<body><section id="shell"><article class="card"><h3>Title</h3><p>Words</p><img src="a.png" alt="A"></article></section></body>'
export const el = (nodes: NodeMap, selector: (node: ElementNode) => boolean) => Object.values(nodes).find((node): node is ElementNode => isElement(node) && selector(node))!
export const byTag = (nodes: NodeMap, tag: string, within?: string) => Object.values(nodes).filter((node): node is ElementNode => isElement(node) && node.tag === tag && (!within || isInside(nodes, node.id, within)))
const isInside = (nodes: NodeMap, id: string, ancestor: string): boolean => id === ancestor || (!!nodes[id]?.parentId && isInside(nodes, nodes[id]!.parentId!, ancestor))
export const textOf = (nodes: NodeMap, id: string) => getTextContent(nodes, id)

/** A page with a main component "Card" and two instances after it; `change` edits nodes like an editor action would, through the store. */
export function setup() {
  let doc = parseHtmlDocument(HTML)
  const card = el(doc.nodes, (n) => n.attrs.class === 'card')
  let nodes = makeComponent(doc.nodes, card.id, 'Card')
  const shell = el(nodes, (n) => n.attrs.id === 'shell')
  for (const offset of [1, 2]) {
    const copy = instantiate(nodes, card.id)
    nodes = insertSubtree(nodes, copy.nodes, copy.topId, shell.id, offset)
  }
  doc = { ...doc, nodes }
  useDocStore.getState().load(doc)
  return { main: card.id, instances: () => instancesOf(getDoc().nodes, card.id) }
}
export const edit = (change: (nodes: NodeMap) => NodeMap) => useDocStore.getState().commit({ ...getDoc(), nodes: change(getDoc().nodes) })
export const mainChild = (tag: string, main: string) => byTag(getDoc().nodes, tag, main)[0]!
export const instChild = (tag: string, instance: string) => byTag(getDoc().nodes, tag, instance)[0]!
export const setText = (nodeId: string, text: string) => edit((nodes) => patchNode<TextNode>(nodes, (nodes[nodeId] as ElementNode).children[0]!, (n) => ({ ...n, text })))

