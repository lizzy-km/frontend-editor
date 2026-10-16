import { collectSubtreeIds } from '../tree/queries'
import { isElement, type ElementNode, type NodeMap } from '../types'

/**
 * Reusable components, like Figma's: one MAIN component (a box marked with a name) and any number of INSTANCES.
 * An instance is a real copy in the page, so every word and picture can be edited in place. Changes to the main
 * component are carried to the instances (propagate.ts), except for what an instance changed itself.
 *   main component:  <section data-fe-component="Product card">…</section>        (hidden in Preview and downloads)
 *   instance:        <section data-fe-instance="<main id>" data-fe-of="<main id>">…each box has data-fe-of="<its main box id>"…
 */
export const COMPONENT_ATTR = 'data-fe-component'
export const INSTANCE_ATTR = 'data-fe-instance'
export const OF_ATTR = 'data-fe-of'

export const isMain = (node: unknown): node is ElementNode => isElement(node as ElementNode) && COMPONENT_ATTR in (node as ElementNode).attrs
export const isInstance = (node: unknown): node is ElementNode => isElement(node as ElementNode) && INSTANCE_ATTR in (node as ElementNode).attrs

export const elementsOf = (nodes: NodeMap) => Object.values(nodes).filter((node): node is ElementNode => isElement(node))

/** The main components of a page, in page order of creation (map order). */
export const mainsOf = (nodes: NodeMap) => elementsOf(nodes).filter(isMain)

/** The instances (top boxes) of one main component. */
export const instancesOf = (nodes: NodeMap, mainId: string) => elementsOf(nodes).filter((node) => node.attrs[INSTANCE_ATTR] === mainId)

/** The main component an instance copies (null when it was deleted). */
export const mainOf = (nodes: NodeMap, instance: ElementNode): ElementNode | null => {
  const main = nodes[instance.attrs[INSTANCE_ATTR] ?? '']
  return isMain(main) ? main : null
}

/** The component an element belongs to (itself or a box around it): a main component or an instance. */
export function componentAround(nodes: NodeMap, id: string | null): { kind: 'main' | 'instance'; root: ElementNode } | null {
  for (let current = id; current; current = nodes[current]?.parentId ?? null) {
    const node = nodes[current]
    if (isMain(node)) return { kind: 'main', root: node }
    if (isInstance(node)) return { kind: 'instance', root: node }
  }
  return null
}

/** A name nobody uses yet: "Card", "Card 2"… */
export function uniqueComponentName(nodes: NodeMap, wanted: string, ignoreId?: string): string {
  const taken = new Set(mainsOf(nodes).filter((node) => node.id !== ignoreId).map((node) => node.attrs[COMPONENT_ATTR]))
  const base = wanted.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Component'
  let name = base
  for (let n = 2; taken.has(name); n++) name = `${base} ${n}`
  return name
}

/** Everything inside a box that is itself a component (so it can't become one, or hold one). */
export const holdsComponent = (nodes: NodeMap, id: string) => collectSubtreeIds(nodes, id).some((item) => isMain(nodes[item]) || isInstance(nodes[item]) || (nodes[item] as ElementNode | undefined)?.attrs?.[OF_ATTR] !== undefined)
