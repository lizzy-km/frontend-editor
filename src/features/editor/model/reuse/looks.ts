import { cloneSubtree } from '../tree/cloneSubtree'
import { collectSubtreeIds, indexInParent } from '../tree/queries'
import { insertSubtree, patchNode, removeNode } from '../tree/treeOps'
import { isElement, type Breakpoint, type ElementNode, type NodeMap, type TextNode } from '../types'
import { COMPONENT_ATTR, INSTANCE_ATTR, KEY_ATTR, LIBRARY_ATTR, OF_ATTR, PART_ATTR, VARIANT_ATTR, elementsOf, instancesOf, isMain, looksOf, lookName, mainOf } from './attrs'
import { instantiate } from './make'

/**
 * Looks (variants): one component with several named designs, like Figma's variants. Each look is its own main component
 * (they share the component's name); every box carries the same key (data-fe-key) in every look, so a copy can switch look and
 * keep what it changed itself. Parts: a box named as an option (data-fe-part) that each copy can show or hide.
 */
const SIZES: Breakpoint[] = ['desktop', 'tablet', 'mobile']
const NOT_COPIED = new Set(['id', COMPONENT_ATTR, INSTANCE_ATTR, OF_ATTR, VARIANT_ATTR, KEY_ATTR, LIBRARY_ATTR])

const setAttr = (nodes: NodeMap, id: string, name: string, value: string | null) =>
  patchNode<ElementNode>(nodes, id, (node) => {
    const attrs = { ...node.attrs }
    if (value === null) delete attrs[name]
    else attrs[name] = value
    return { ...node, attrs }
  })

/** Gives every box of a main component its key (its own id) so looks made from it can be matched. */
export function ensureKeys(nodes: NodeMap, mainId: string): NodeMap {
  let next = nodes
  for (const id of collectSubtreeIds(nodes, mainId)) if (isElement(next[id]) && !(next[id] as ElementNode).attrs[KEY_ATTR]) next = setAttr(next, id, KEY_ATTR, id)
  return next
}

/** A look name nobody in this component uses yet. */
export function uniqueLookName(nodes: NodeMap, main: ElementNode, wanted: string, ignoreId?: string): string {
  const taken = new Set(looksOf(nodes, main).filter((look) => look.id !== ignoreId).map(lookName))
  const base = wanted.trim().slice(0, 30) || 'Look'
  let name = base
  for (let n = 2; taken.has(name); n++) name = `${base} ${n}`
  return name
}

/** A new look: a copy of this main component with the same keys, placed after it. The first look is called "Default". */
export function addLook(nodes: NodeMap, mainId: string, wanted: string): { nodes: NodeMap; id: string } | null {
  const main = nodes[mainId] as ElementNode | undefined
  if (!main?.parentId || !isMain(main)) return null
  let next = ensureKeys(nodes, mainId)
  if (!main.attrs[VARIANT_ATTR]) next = setAttr(next, mainId, VARIANT_ATTR, 'Default')
  const copy = cloneSubtree(next, mainId)
  const placed = insertSubtree(next, copy.nodes, copy.topId, main.parentId, indexInParent(next, mainId) + 1)
  return { nodes: setAttr(placed, copy.topId, VARIANT_ATTR, uniqueLookName(placed, placed[copy.topId] as ElementNode, wanted, copy.topId)), id: copy.topId }
}

export const renameLook = (nodes: NodeMap, mainId: string, wanted: string): NodeMap =>
  setAttr(nodes, mainId, VARIANT_ATTR, uniqueLookName(nodes, nodes[mainId] as ElementNode, wanted, mainId))

type Changes = { attrs: Record<string, string | undefined>; styles: Partial<Record<Breakpoint, Record<string, string | undefined>>>; hidden?: boolean | 'same'; texts: Record<number, string> }

/** What a copy's box changed compared with the main box it copies (by key). */
function changesOf(nodes: NodeMap, copy: ElementNode, main: ElementNode): Changes {
  const attrs: Changes['attrs'] = {}
  for (const name of new Set([...Object.keys(copy.attrs), ...Object.keys(main.attrs)])) if (!NOT_COPIED.has(name) && copy.attrs[name] !== main.attrs[name]) attrs[name] = copy.attrs[name]
  const styles: Changes['styles'] = {}
  for (const size of SIZES) {
    const a = copy.styles[size] ?? {}
    const b = main.styles[size] ?? {}
    for (const prop of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[prop] !== b[prop]) (styles[size] ??= {})[prop] = a[prop]
  }
  const copyTexts = copy.children.map((id) => nodes[id]).filter((node): node is TextNode => node?.kind === 'text')
  const mainTexts = main.children.map((id) => nodes[id]).filter((node): node is TextNode => node?.kind === 'text')
  const texts: Changes['texts'] = {}
  if (copyTexts.length === mainTexts.length) copyTexts.forEach((node, index) => { if (node.text !== mainTexts[index]!.text) texts[index] = node.text })
  return { attrs, styles, hidden: copy.hidden === main.hidden ? 'same' : copy.hidden, texts }
}

/** Puts the changes on a fresh box. */
function applyChanges(nodes: NodeMap, id: string, changes: Changes): NodeMap {
  let next = patchNode<ElementNode>(nodes, id, (node) => {
    const attrs = { ...node.attrs }
    for (const [name, value] of Object.entries(changes.attrs)) { if (value === undefined) delete attrs[name]; else attrs[name] = value }
    const styles: ElementNode['styles'] = { ...node.styles }
    for (const size of SIZES) {
      const map = { ...(styles[size] ?? {}) }
      for (const [prop, value] of Object.entries(changes.styles[size] ?? {})) { if (value === undefined) delete map[prop]; else map[prop] = value }
      if (Object.keys(map).length) styles[size] = map
      else delete styles[size]
    }
    return { ...node, attrs, styles, ...(changes.hidden === 'same' ? {} : { hidden: changes.hidden }) }
  })
  const fresh = (next[id] as ElementNode).children.map((child) => next[child]).filter((node): node is TextNode => node?.kind === 'text')
  for (const [index, text] of Object.entries(changes.texts)) if (fresh[Number(index)]) next = patchNode<TextNode>(next, fresh[Number(index)]!.id, (node) => ({ ...node, text }))
  return next
}

/** A copy switches to another look of its component and keeps what it changed itself (matched box by box through the keys). */
export function swapLook(nodes: NodeMap, copyId: string, targetMainId: string): NodeMap {
  const copy = nodes[copyId] as ElementNode | undefined
  const current = copy && mainOf(nodes, copy)
  if (!copy?.parentId || !current || !isMain(nodes[targetMainId]) || current.id === targetMainId) return nodes
  const kept = new Map<string, Changes>()
  for (const id of collectSubtreeIds(nodes, copyId)) {
    const box = nodes[id]
    const source = isElement(box) ? nodes[box.attrs[OF_ATTR] ?? ''] : undefined
    const key = isElement(source) ? source.attrs[KEY_ATTR] : undefined
    if (isElement(box) && isElement(source) && key) kept.set(key, changesOf(nodes, box, source))
  }
  const fresh = instantiate(nodes, targetMainId, copyId)
  for (const id of Object.keys(fresh.nodes)) {
    const box = fresh.nodes[id]
    const key = isElement(box) ? (nodes[box.attrs[OF_ATTR] ?? ''] as ElementNode | undefined)?.attrs[KEY_ATTR] : undefined
    const changes = key ? kept.get(key) : undefined
    if (changes) Object.assign(fresh.nodes, applyChanges(fresh.nodes, id, changes))
  }
  return insertSubtree(removeNode(nodes, copyId), fresh.nodes, copyId, copy.parentId, indexInParent(nodes, copyId))
}

/** Removes a look; its copies switch to the default look first (the only look can't be removed). */
export function deleteLook(nodes: NodeMap, mainId: string): NodeMap {
  const main = nodes[mainId] as ElementNode | undefined
  const others = main ? looksOf(nodes, main).filter((look) => look.id !== mainId) : []
  if (!main || !others.length) return nodes
  let next = nodes
  for (const copy of instancesOf(nodes, mainId)) next = swapLook(next, copy.id, others[0]!.id)
  return removeNode(next, mainId)
}

export type Part = { id: string; name: string }

/** The named parts of a main component (the options each copy can show or hide). */
export const partsOf = (nodes: NodeMap, mainId: string): Part[] =>
  collectSubtreeIds(nodes, mainId).slice(1).map((id) => nodes[id]).filter((node): node is ElementNode => isElement(node) && Boolean(node.attrs[PART_ATTR])).map((node) => ({ id: node.id, name: node.attrs[PART_ATTR]! }))

const copyBoxOf = (nodes: NodeMap, copyId: string, partId: string) => collectSubtreeIds(nodes, copyId).map((id) => nodes[id]).find((node) => isElement(node) && node.attrs[OF_ATTR] === partId) as ElementNode | undefined

/** Is this part shown in this copy? */
export const partShown = (nodes: NodeMap, copyId: string, partId: string) => !copyBoxOf(nodes, copyId, partId)?.hidden

/** Shows or hides a part in one copy (the main component and the other copies are not touched). */
export function setPartShown(nodes: NodeMap, copyId: string, partId: string, shown: boolean): NodeMap {
  const box = copyBoxOf(nodes, copyId, partId)
  return box ? patchNode<ElementNode>(nodes, box.id, (node) => ({ ...node, hidden: shown ? undefined : true })) : nodes
}

/** Names (or, with an empty name, un-names) a box of a main component as an option. */
export const setPartName = (nodes: NodeMap, id: string, name: string): NodeMap => setAttr(nodes, id, PART_ATTR, name.trim() || null)

/** The main components that are the first (default) look of their component. */
export const defaultLooks = (nodes: NodeMap) => elementsOf(nodes).filter((node) => isMain(node) && looksOf(nodes, node)[0]?.id === node.id)
