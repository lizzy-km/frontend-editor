import { instantiate, makeComponent } from '@/features/editor/model/reuse/make'
import { addLook, swapLook } from '@/features/editor/model/reuse/looks'
import { collectSubtreeIds, getElement } from '@/features/editor/model/tree/queries'
import { insertSubtree, patchNode } from '@/features/editor/model/tree/treeOps'
import { isElement, type ElementNode, type NodeMap, type PageDoc, type TextNode } from '@/features/editor/model/types'
import { photo, type PhotoName } from './photos'

const MEMBERS: { name: string; role: string; photo: PhotoName }[] = [
  { name: 'Inês Carvalho', role: 'Creative director', photo: 'woman' },
  { name: 'Tomás Ferreira', role: 'Lead developer', photo: 'man' },
  { name: 'Leila Haddad', role: 'Brand designer', photo: 'woman2' },
  { name: 'Marcus Webb', role: 'Motion designer', photo: 'man2' },
]

const within = (nodes: NodeMap, rootId: string, tag: string) =>
  collectSubtreeIds(nodes, rootId).map((id) => getElement(nodes, id)).filter((node): node is ElementNode => Boolean(node) && node!.tag === tag)

/** Changes the words of a box that holds one piece of text. */
function setWords(nodes: NodeMap, boxId: string, text: string): NodeMap {
  const first = (nodes[boxId] as ElementNode).children[0]
  return first ? patchNode<TextNode>(nodes, first, (node) => ({ ...node, text })) : nodes
}

/** Adds style rules to one box for the desktop size (and so, for every size). */
const restyle = (nodes: NodeMap, id: string, rules: Record<string, string>): NodeMap =>
  patchNode<ElementNode>(nodes, id, (node) => ({ ...node, styles: { ...node.styles, desktop: { ...node.styles.desktop, ...rules } } }))

/** Gives the second look "Dark" its own colours, box by box. */
function darken(nodes: NodeMap, darkId: string): NodeMap {
  let next = restyle(nodes, darkId, { background: '#0e0f12', 'border-color': '#2a2c33' })
  for (const heading of within(next, darkId, 'h3')) next = restyle(next, heading.id, { color: '#f6f3ee' })
  for (const line of within(next, darkId, 'p')) next = restyle(next, line.id, { color: '#a9a69e' })
  return next
}

/** Turns the team grid's card into the main component "Team member" (with a Dark look) and fills the grid with four copies, each with its own person. */
export function addTeamComponent(doc: PageDoc): PageDoc {
  let nodes = doc.nodes
  const grid = Object.values(nodes).find((node): node is ElementNode => isElement(node) && (node.attrs.class ?? '').includes('ag-team-grid'))
  const main = grid?.children.map((id) => getElement(nodes, id)).find(Boolean)
  if (!grid || !main) throw new Error('The Team page needs its grid and one card to turn into a component.')
  nodes = makeComponent(nodes, main.id, 'Team member')
  const dark = addLook(nodes, main.id, 'Dark')!
  nodes = darken(dark.nodes, dark.id)
  MEMBERS.forEach((member, index) => {
    const copy = instantiate(nodes, main.id)
    nodes = insertSubtree(nodes, copy.nodes, copy.topId, grid.id, index)
    nodes = setWords(nodes, within(nodes, copy.topId, 'h3')[0]!.id, member.name)
    nodes = setWords(nodes, within(nodes, copy.topId, 'p')[0]!.id, member.role)
    const image = within(nodes, copy.topId, 'img')[0]!
    nodes = patchNode<ElementNode>(nodes, image.id, (node) => ({ ...node, attrs: { ...node.attrs, src: photo(member.photo, 600, 600), alt: `Portrait of ${member.name}` } }))
    if (index === 3) nodes = swapLook(nodes, copy.topId, dark.id)
  })
  return { ...doc, nodes }
}
