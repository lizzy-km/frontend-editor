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
/** On a main component's top box: the name of its look (a variant) inside the component. Looks of one component share its name. */
export const VARIANT_ATTR = 'data-fe-variant'
/** On every box of a component that has looks: the same key in every look, so a copy can switch look and keep its changes. */
export const KEY_ATTR = 'data-fe-key'
/** On a box inside a main component: its name as an option, so each copy can show or hide it. */
export const PART_ATTR = 'data-fe-part'
/** On a main component's top box: where it came from in the account library, `<entry id>@<version>`. */
export const LIBRARY_ATTR = 'data-fe-library'

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

/** The main components that are looks of the same component (they share its name), the first one being the default look. */
export const looksOf = (nodes: NodeMap, main: ElementNode) => mainsOf(nodes).filter((node) => node.attrs[COMPONENT_ATTR] === main.attrs[COMPONENT_ATTR])

/** The name of a look ("Default" until it is named). */
export const lookName = (main: ElementNode) => main.attrs[VARIANT_ATTR] || 'Default'

/** A name nobody uses yet: "Card", "Card 2"… (the looks of one component share a name, so `ignoreId` skips the whole set). */
export function uniqueComponentName(nodes: NodeMap, wanted: string, ignoreId?: string): string {
  const own = ignoreId && isMain(nodes[ignoreId]) ? (nodes[ignoreId] as ElementNode).attrs[COMPONENT_ATTR] : undefined
  const taken = new Set(mainsOf(nodes).filter((node) => node.id !== ignoreId && node.attrs[COMPONENT_ATTR] !== own).map((node) => node.attrs[COMPONENT_ATTR]))
  const base = wanted.trim().replace(/\s+/g, ' ').slice(0, 40) || 'Component'
  let name = base
  for (let n = 2; taken.has(name); n++) name = `${base} ${n}`
  return name
}

/** Everything inside a box that is itself a component (so it can't become one, or hold one). */
export const holdsComponent = (nodes: NodeMap, id: string) => collectSubtreeIds(nodes, id).some((item) => isMain(nodes[item]) || isInstance(nodes[item]) || (nodes[item] as ElementNode | undefined)?.attrs?.[OF_ATTR] !== undefined)
