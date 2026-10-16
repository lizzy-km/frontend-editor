import { createId } from '@/lib/ids'
import { RECORD_ATTR, ROW_ATTR } from '../dataRecords'
import { isPageNode } from '../pages'
import { collectSubtreeIds, getElement, indexInParent } from '../tree/queries'
import { insertSubtree, patchNode, removeNode } from '../tree/treeOps'
import { isElement, type ElementNode, type NodeMap } from '../types'
import { COMPONENT_ATTR, INSTANCE_ATTR, OF_ATTR, componentAround, holdsComponent, isMain, mainOf, uniqueComponentName } from './attrs'

/** Can this box become a main component? Not the page itself, not something already part of a component. */
export function canMakeComponent(nodes: NodeMap, id: string, rootId: string): boolean {
  const node = getElement(nodes, id)
  return Boolean(node && id !== rootId && !isPageNode(node) && node.tag !== 'body' && !componentAround(nodes, id) && !holdsComponent(nodes, id))
}

/** Marks a box as a main component with a name. The box stays where it is, as the one the instances copy. */
export function makeComponent(nodes: NodeMap, id: string, wanted: string): NodeMap {
  const name = uniqueComponentName(nodes, wanted)
  return patchNode<ElementNode>(nodes, id, (node) => ({ ...node, attrs: { ...node.attrs, [COMPONENT_ATTR]: name } }))
}

/** Renames a main component. */
export const renameComponent = (nodes: NodeMap, id: string, wanted: string): NodeMap =>
  patchNode<ElementNode>(nodes, id, (node) => ({ ...node, attrs: { ...node.attrs, [COMPONENT_ATTR]: uniqueComponentName(nodes, wanted, id) } }))

/** A copy of a branch of a main component, each box pointing at the box it copies (data-fe-of). `topId` keeps an existing id. */
export function copyBranch(nodes: NodeMap, sourceId: string, topId = createId()): { nodes: NodeMap; topId: string } {
  const copies: NodeMap = {}
  const copy = (id: string, parentId: string | null, wanted?: string): string => {
    const source = nodes[id]
    if (!source) return ''
    const newId = wanted ?? createId()
    if (!isElement(source)) {
      copies[newId] = { ...source, id: newId, parentId }
      return newId
    }
    const attrs: Record<string, string> = { ...source.attrs, [OF_ATTR]: id }
    delete attrs.id
    delete attrs[COMPONENT_ATTR]
    copies[newId] = { ...source, id: newId, parentId, attrs, children: source.children.map((child) => copy(child, newId)).filter(Boolean) }
    return newId
  }
  copy(sourceId, null, topId)
  return { nodes: copies, topId }
}

/** A new instance of a main component: a copy of all its boxes. `topId` keeps an existing instance's id. */
export function instantiate(nodes: NodeMap, mainId: string, topId = createId()): { nodes: NodeMap; topId: string } {
  const branch = copyBranch(nodes, mainId, topId)
  const top = branch.nodes[topId] as ElementNode
  branch.nodes[topId] = { ...top, attrs: { ...top.attrs, [INSTANCE_ATTR]: mainId } }
  return branch
}

/** The top box of an instance becomes a normal box again (no longer follows the main component). */
export function detachInstance(nodes: NodeMap, id: string): NodeMap {
  let next = nodes
  for (const item of collectSubtreeIds(nodes, id)) {
    next = patchNode<ElementNode>(next, item, (node) => {
      const attrs = { ...node.attrs }
      delete attrs[OF_ATTR]
      delete attrs[INSTANCE_ATTR]
      return { ...node, attrs }
    })
  }
  return next
}

/** Throws away what an instance changed: it becomes a fresh copy of the main component (its data choice is kept). */
export function resetInstance(nodes: NodeMap, id: string): NodeMap {
  const instance = getElement(nodes, id)
  const main = instance && mainOf(nodes, instance)
  if (!instance || !main || !instance.parentId) return nodes
  const fresh = instantiate(nodes, main.id, id)
  const top = fresh.nodes[id] as ElementNode
  const own = Object.fromEntries([RECORD_ATTR, ROW_ATTR].filter((name) => name in instance.attrs).map((name) => [name, instance.attrs[name]!]))
  fresh.nodes[id] = { ...top, attrs: { ...top.attrs, ...own } }
  const at = indexInParent(nodes, id)
  return insertSubtree(removeNode(nodes, id), fresh.nodes, id, instance.parentId, at)
}

/** Takes a main component out of the way: its instances become normal boxes and the box loses its name. */
export function releaseComponent(nodes: NodeMap, mainId: string): NodeMap {
  let next = nodes
  for (const node of Object.values(nodes)) if (isElement(node) && node.attrs[INSTANCE_ATTR] === mainId) next = detachInstance(next, node.id)
  return isMain(next[mainId]) ? patchNode<ElementNode>(next, mainId, (node) => {
    const attrs = { ...node.attrs }
    delete attrs[COMPONENT_ATTR]
    return { ...node, attrs }
  }) : next
}
