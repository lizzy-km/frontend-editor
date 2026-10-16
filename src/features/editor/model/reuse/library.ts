import { cloneSubtree } from '../tree/cloneSubtree'
import { indexInParent } from '../tree/queries'
import { insertSubtree } from '../tree/treeOps'
import type { ElementNode, NodeMap } from '../types'
import { COMPONENT_ATTR, VARIANT_ATTR, instancesOf, looksOf, lookName, mainsOf, uniqueComponentName } from './attrs'

/** A look of a component: its main box and the copies that follow it. */
export type LookInfo = { id: string; label: string; copies: string[] }

/** The components of a page, for the Components panel: `id` is the default look, `copies` are the copies of every look. */
export type ComponentInfo = { id: string; name: string; copies: string[]; looks: LookInfo[] }

/** Every component (looks of one component are grouped) with the ids of its copies. */
export const componentList = (nodes: NodeMap): ComponentInfo[] =>
  mainsOf(nodes).filter((main) => looksOf(nodes, main)[0]!.id === main.id).map((main) => {
    const looks = looksOf(nodes, main).map((look) => ({ id: look.id, label: lookName(look), copies: instancesOf(nodes, look.id).map((copy) => copy.id) }))
    return { id: main.id, name: main.attrs[COMPONENT_ATTR] ?? '', looks, copies: looks.flatMap((look) => look.copies) }
  })

/** A new main component made as a copy of another, placed after it (its own copies start empty). */
export function duplicateComponent(nodes: NodeMap, mainId: string): { nodes: NodeMap; id: string } | null {
  const main = nodes[mainId] as ElementNode | undefined
  if (!main?.parentId) return null
  const copy = cloneSubtree(nodes, mainId)
  const placed = insertSubtree(nodes, copy.nodes, copy.topId, main.parentId, indexInParent(nodes, mainId) + 1)
  // A new component of its own: a name of its own, and not a look of the original.
  const name = uniqueComponentName(placed, `${main.attrs[COMPONENT_ATTR] ?? 'Component'} copy`, copy.topId)
  const attrs: Record<string, string> = { ...(placed[copy.topId] as ElementNode).attrs, [COMPONENT_ATTR]: name }
  delete attrs[VARIANT_ATTR]
  return { nodes: { ...placed, [copy.topId]: { ...(placed[copy.topId] as ElementNode), attrs } }, id: copy.topId }
}

const BUTTON = 'display: inline-block; padding: 12px 22px; border-radius: 10px; background: #e8573a; color: #fff; text-decoration: none; font-weight: 700'
const BOX = 'box-sizing: border-box; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background: #fff'

/** Starting points for a new component (plain HTML; every style is editable afterwards). */
export const COMPONENT_STARTS: { id: string; label: string; name: string; hint: string; html: string }[] = [
  { id: 'box', label: 'Empty box', name: 'Box', hint: 'A box with a title and a line of text', html: `<div style="${BOX}"><h3 style="margin: 0 0 8px">Component title</h3><p style="margin: 0; color: #57534e">Describe it here. Everything inside is yours to change.</p></div>` },
  { id: 'card', label: 'Card', name: 'Card', hint: 'A picture, a title, some text and a button', html: `<article style="${BOX}; max-width: 340px; display: grid; gap: 12px"><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" alt="" style="width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 12px"><h3 style="margin: 0">Card title</h3><p style="margin: 0; color: #57534e">A short line about it.</p><a href="#" style="${BUTTON}">Read more</a></article>` },
  { id: 'button', label: 'Button', name: 'Button', hint: 'One button', html: `<a href="#" style="${BUTTON}">Button</a>` },
  { id: 'banner', label: 'Banner', name: 'Banner', hint: 'A wide strip with a heading, text and a button', html: `<section style="padding: 40px 24px; border-radius: 20px; background: #1c1917; color: #fff; display: grid; gap: 12px; justify-items: start"><h2 style="margin: 0">A big message</h2><p style="margin: 0; opacity: .8">Say it in one or two lines.</p><a href="#" style="${BUTTON}">Get started</a></section>` },
  { id: 'person', label: 'Person', name: 'Person', hint: 'A photo, a name and a role', html: `<div style="${BOX}; display: flex; gap: 14px; align-items: center"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover"><div><strong>Full name</strong><p style="margin: 2px 0 0; color: #57534e">Role</p></div></div>` },
]
