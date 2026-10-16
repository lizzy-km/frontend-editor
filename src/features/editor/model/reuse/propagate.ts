import { createId } from '@/lib/ids'
import { collectSubtreeIds } from '../tree/queries'
import { isElement, type Breakpoint, type ElementNode, type EditorNode, type NodeMap, type StyleMap, type TextNode } from '../types'
import { COMPONENT_ATTR, INSTANCE_ATTR, LIBRARY_ATTR, OF_ATTR, elementsOf, instancesOf, isInstance, isMain, mainOf } from './attrs'
import { copyBranch, detachInstance } from './make'

/**
 * Carries a main component's changes to its instances. A three-way merge: an instance's value is replaced by the main
 * component's new value only when it still equals the OLD main value (so the instance had not changed it). What an
 * instance changed itself stays. Boxes added to or removed from the main component are added to or removed from every instance.
 */
const OWN = new Set(['id', COMPONENT_ATTR, INSTANCE_ATTR, OF_ATTR, LIBRARY_ATTR])
const SIZES: Breakpoint[] = ['desktop', 'tablet', 'mobile']

type Merge = { prev: NodeMap; next: NodeMap; out: NodeMap; map: Map<string, string>; touched: boolean }

/** The record: take `wanted` where `current` is still `base` (the instance had not changed it). */
function merged(base: Record<string, string> | undefined, current: Record<string, string> | undefined, wanted: Record<string, string> | undefined, skip: (name: string) => boolean = () => false) {
  const result = { ...current }
  for (const name of new Set([...Object.keys(wanted ?? {}), ...Object.keys(base ?? {})])) {
    if (skip(name) || current?.[name] !== base?.[name]) continue
    if (wanted?.[name] === undefined) delete result[name]
    else result[name] = wanted[name]!
  }
  return result
}

function patchProps(inst: ElementNode, old: ElementNode, now: ElementNode): ElementNode {
  const attrs = merged(old.attrs, inst.attrs, now.attrs, (name) => OWN.has(name))
  const styles: ElementNode['styles'] = {}
  for (const size of SIZES) {
    const map = merged(old.styles[size] as StyleMap | undefined, inst.styles[size] as StyleMap | undefined, now.styles[size] as StyleMap | undefined)
    if (Object.keys(map).length) styles[size] = map
  }
  const hidden = inst.hidden === old.hidden ? now.hidden : inst.hidden
  const tag = inst.tag === old.tag ? now.tag : inst.tag
  const same = JSON.stringify([attrs, styles]) === JSON.stringify([inst.attrs, inst.styles]) && hidden === inst.hidden && tag === inst.tag
  return same ? inst : { ...inst, attrs, styles, hidden, tag }
}

const texts = (nodes: NodeMap, ids: string[]) => ids.map((id) => nodes[id]).filter((node): node is TextNode => node?.kind === 'text')
const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, index) => id === b[index])

/** A new box of the main component, copied into the instance with its boxes mapped. */
function addBranch(m: Merge, mainChild: string, parentId: string): string {
  const branch = copyBranch(m.next, mainChild)
  for (const [id, node] of Object.entries(branch.nodes)) {
    m.out[id] = id === branch.topId ? { ...node, parentId } : node
    if (isElement(node)) m.map.set(node.attrs[OF_ATTR]!, id)
  }
  m.touched = true
  return branch.topId
}

function rebuildChildren(m: Merge, mainNode: ElementNode, oldMain: ElementNode | undefined, instId: string) {
  const inst = m.out[instId] as ElementNode
  const kept = new Set<string>()
  const oldTexts = oldMain ? texts(m.prev, oldMain.children) : []
  const instTexts = texts(m.out, inst.children)
  let textAt = 0
  const children = mainNode.children.map((childId): string => {
    const child = m.next[childId] as EditorNode
    if (isElement(child)) {
      const existing = m.map.get(childId)
      if (existing && m.out[existing]?.parentId === instId) { kept.add(existing); return existing }
      return addBranch(m, childId, instId)
    }
    const mine = instTexts[textAt]
    const before = oldTexts[textAt]
    textAt += 1
    if (mine) { // keep this instance's own words unless it still has the old main words
      const text = before && mine.text === before.text ? child.text : mine.text
      m.out[mine.id] = text === mine.text ? mine : { ...mine, text }
      kept.add(mine.id)
      return mine.id
    }
    const id = createId()
    m.out[id] = { ...child, id, parentId: instId }
    return id
  })
  for (const old of inst.children) {
    if (kept.has(old) || children.includes(old)) continue
    for (const gone of collectSubtreeIds(m.out, old)) {
      delete m.out[gone]
      for (const [key, value] of m.map) if (value === gone) m.map.delete(key)
    }
  }
  m.out[instId] = { ...(m.out[instId] as ElementNode), children }
  m.touched = true
  for (const childId of mainNode.children) if (isElement(m.next[childId]) && kept.has(m.map.get(childId) ?? '') && m.prev[childId]) syncNode(m, childId)
}

function syncNode(m: Merge, mainId: string) {
  const now = m.next[mainId] as ElementNode
  const old = m.prev[mainId] as ElementNode | undefined
  const instId = m.map.get(mainId)
  if (!instId || !m.out[instId]) return
  if (old && old !== now) {
    const before = m.out[instId] as ElementNode
    const after = patchProps(before, old, now)
    if (after !== before) { m.out[instId] = after; m.touched = true }
  }
  if (!old || !sameIds(old.children, now.children)) return rebuildChildren(m, now, old, instId)
  const inst = m.out[instId] as ElementNode
  now.children.forEach((childId, index) => {
    const child = m.next[childId] as EditorNode
    if (isElement(child)) return syncNode(m, childId)
    const mine = m.out[inst.children[index] ?? '']
    const before = m.prev[childId]
    if (mine?.kind === 'text' && before?.kind === 'text' && before !== child && mine.text === before.text) { m.out[mine.id] = { ...mine, text: child.text }; m.touched = true }
  })
}

const changedBranch = (prev: NodeMap, next: NodeMap, id: string) => !prev[id] || collectSubtreeIds(next, id).some((item) => prev[item] !== next[item])

/** The page after a change, with every main component's changes carried to its instances (the same nodes when nothing needed carrying). */
export function propagate(prev: NodeMap, next: NodeMap): NodeMap {
  const all = elementsOf(next)
  const roots = all.filter(isInstance)
  if (!roots.length) return next
  let out: NodeMap = { ...next }
  let touched = false
  for (const root of roots) {
    if (mainOf(next, root)) continue
    out = detachInstance(out, root.id) // its main component is gone
    touched = true
  }
  for (const main of all.filter(isMain)) {
    if (!changedBranch(prev, next, main.id)) continue
    for (const inst of instancesOf(out, main.id)) {
      const map = new Map<string, string>()
      for (const id of collectSubtreeIds(out, inst.id)) {
        const node = out[id]
        if (isElement(node) && node.attrs[OF_ATTR]) map.set(node.attrs[OF_ATTR], id)
      }
      const merge: Merge = { prev, next, out, map, touched: false }
      syncNode(merge, main.id)
      out = merge.out
      touched ||= merge.touched
    }
  }
  return touched ? out : next
}
