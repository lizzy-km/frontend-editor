import { cloneSubtree } from '../model/tree/cloneSubtree'
import { getElement, indexInParent } from '../model/tree/queries'
import { moveNode, patchNode, removeNode } from '../model/tree/treeOps'
import type { ElementNode } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateNodes } from './commit'
import { countEdit } from './editStats'

const select = (id: string | null) => useSelectionStore.getState().select(id)

/** Deletes an element and selects its parent, so the user never feels "lost". */
export function deleteNode(id: string) {
  const doc = getDoc()
  if (id === doc.rootId) return
  const parentId = doc.nodes[id]?.parentId ?? null
  updateNodes((nodes) => removeNode(nodes, id))
  countEdit('delete')
  select(parentId === doc.rootId ? null : parentId)
}

/** Places a copy right after the original and selects the copy. */
export function duplicateNode(id: string) {
  const doc = getDoc()
  const parentId = doc.nodes[id]?.parentId
  if (!parentId) return
  const copy = cloneSubtree(doc.nodes, id)
  countEdit('duplicate')
  updateNodes((nodes) => {
    const merged = { ...nodes, ...copy.nodes }
    return patchNode<ElementNode>(merged, parentId, (parent) => {
      const children = [...parent.children]
      children.splice(children.indexOf(id) + 1, 0, copy.topId)
      return { ...parent, children }
    })
  })
  select(copy.topId)
}

export function moveNodeTo(id: string, parentId: string, index: number) {
  countEdit('move')
  updateNodes((nodes) => moveNode(nodes, id, parentId, index))
}

/** Moves an element one step up (-1) or down (+1) among its siblings. */
export function nudgeNode(id: string, direction: -1 | 1) {
  const doc = getDoc()
  const parent = getElement(doc.nodes, doc.nodes[id]?.parentId)
  if (!parent) return
  const index = indexInParent(doc.nodes, id)
  const target = direction === -1 ? index - 1 : index + 2
  if (target < 0 || target > parent.children.length) return
  moveNodeTo(id, parent.id, target)
}

export function selectParent(id: string) {
  const doc = getDoc()
  const parentId = doc.nodes[id]?.parentId
  select(parentId && parentId !== doc.rootId ? parentId : null)
}

/** Sets an HTML attribute (link address, image source...). Empty value removes it. */
export function setAttribute(id: string, name: string, value: string) {
  countEdit(name === 'src' ? 'picture' : 'attribute', `attr:${id}:${name}`)
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => {
    const attrs = { ...node.attrs }
    if (value === '' && name !== 'alt') delete attrs[name]
    else attrs[name] = value
    return { ...node, attrs }
  }), `attr:${id}:${name}`)
}

/** Several attributes as ONE undo step. Empty values remove the attribute (except alt). */
export function setAttributes(id: string, values: Record<string, string>) {
  countEdit('src' in values ? 'picture' : 'attribute')
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => {
    const attrs = { ...node.attrs }
    for (const [name, value] of Object.entries(values)) {
      if (value === '' && name !== 'alt') delete attrs[name]
      else attrs[name] = value
    }
    return { ...node, attrs }
  }))
}

export function toggleHidden(id: string) {
  countEdit('hide')
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => ({ ...node, hidden: !node.hidden })))
}

/** Changes the element type, e.g. a <h2> into a <h1>. Content is kept. */
export function changeTag(id: string, tag: string) {
  countEdit('tag')
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => ({ ...node, tag })))
}
