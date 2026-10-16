import { createId } from '@/lib/ids'
import { collectSubtreeIds, indexInParent } from '../tree/queries'
import { insertSubtree, removeNode } from '../tree/treeOps'
import { isElement, type ElementNode, type NodeMap, type PageDoc } from '../types'
import { COMPONENT_ATTR, KEY_ATTR, LIBRARY_ATTR, VARIANT_ATTR, looksOf, lookName, uniqueComponentName } from './attrs'
import { ensureKeys } from './looks'
import { pickCss, usageOf } from './pickCss'

/** A component as saved in the account library: every look (boxes keep their keys), the CSS it needs and the stylesheet links. */
export type LibraryEntry = { v: 1; name: string; looks: { nodes: NodeMap; topId: string }[]; css: string; links: string[] }

const marker = (id: string) => `/* tweak-library:${id} */`
const blockEnd = (id: string) => `/* end tweak-library:${id} */`

/** `entry id@version` of a linked main component, or null. */
export function linkOf(main: ElementNode | undefined): { id: string; version: number } | null {
  const match = /^(.+)@(\d+)$/.exec(main?.attrs[LIBRARY_ATTR] ?? '')
  return match ? { id: match[1]!, version: Number(match[2]) } : null
}

/** Gives every look of a component its keys, so the saved entry and this page's boxes can be matched again later. */
export function keyLooks(nodes: NodeMap, mainId: string): NodeMap {
  let next = nodes
  for (const look of looksOf(nodes, nodes[mainId] as ElementNode)) next = ensureKeys(next, look.id)
  return next
}

/** What goes into the library for one component (its boxes need their keys already: see keyLooks). */
export function entryFromComponent(doc: PageDoc, mainId: string): LibraryEntry {
  const mains = looksOf(doc.nodes, doc.nodes[mainId] as ElementNode)
  const looks = mains.map((look) => {
    const ids = collectSubtreeIds(doc.nodes, look.id)
    const nodes: NodeMap = Object.fromEntries(ids.map((id) => [id, doc.nodes[id]!]))
    const attrs = { ...look.attrs }
    delete attrs[LIBRARY_ATTR]
    delete attrs[COMPONENT_ATTR]
    nodes[look.id] = { ...look, parentId: null, attrs }
    return { nodes, topId: look.id }
  })
  const used = looks.flatMap((look) => Object.keys(look.nodes))
  const all: NodeMap = Object.assign({}, ...looks.map((look) => look.nodes))
  return { v: 1, name: mains[0]!.attrs[COMPONENT_ATTR] ?? 'Component', looks, css: pickCss(doc.css, usageOf(all, used)), links: doc.links }
}

/** The saved boxes with new ids (or, for boxes with a key, the id `idForKey` gives); text always gets new ids. */
function rebuild(source: { nodes: NodeMap; topId: string }, topId: string, idForKey: (key: string) => string | undefined, extra: Record<string, string>) {
  const out: NodeMap = {}
  const taken = new Set([topId])
  const copy = (id: string, parentId: string | null): string => {
    const node = source.nodes[id]
    if (!node) return ''
    const key = isElement(node) ? node.attrs[KEY_ATTR] : undefined
    const wanted = key ? idForKey(key) : undefined
    const newId = id === source.topId ? topId : wanted && !taken.has(wanted) ? wanted : createId()
    taken.add(newId)
    if (!isElement(node)) return (out[newId] = { ...node, id: newId, parentId }, newId)
    const attrs = id === source.topId ? { ...node.attrs, ...extra } : { ...node.attrs }
    delete attrs.id
    out[newId] = { ...node, id: newId, parentId, attrs, children: node.children.map((child) => copy(child, newId)).filter(Boolean) }
    return newId
  }
  copy(source.topId, null)
  return out
}

/** The entry's CSS as a marked block in front of the page's own CSS (replacing an older block of the same entry). */
function withCss(css: string, entryId: string, entryCss: string): string {
  const start = css.indexOf(marker(entryId))
  const end = css.indexOf(blockEnd(entryId))
  const rest = start >= 0 && end > start ? css.slice(0, start) + css.slice(end + blockEnd(entryId).length).replace(/^\n/, '') : css
  return entryCss.trim() ? `${marker(entryId)}\n${entryCss}\n${blockEnd(entryId)}\n${rest}` : rest
}

const withLinks = (doc: PageDoc, links: string[]) => [...doc.links, ...links.filter((link) => !doc.links.includes(link))]

/** Puts a library component into the page as a new main component (every look), with its CSS. Returns the first look's id. */
export function addEntry(doc: PageDoc, entry: LibraryEntry, entryId: string, version: number, parentId: string, index: number): { doc: PageDoc; id: string } | null {
  const name = uniqueComponentName(doc.nodes, entry.name)
  let nodes = doc.nodes
  let first = ''
  entry.looks.forEach((look, at) => {
    const top = createId()
    first ||= top
    nodes = insertSubtree(nodes, rebuild(look, top, () => undefined, { [COMPONENT_ATTR]: name, [LIBRARY_ATTR]: `${entryId}@${version}` }), top, parentId, index + at)
  })
  return first && nodes !== doc.nodes ? { doc: { ...doc, nodes, css: withCss(doc.css, entryId, entry.css), links: withLinks(doc, entry.links) }, id: first } : null
}

/** Brings the page's component up to the library's version: boxes are matched by key so copies keep following and keep their own changes. */
export function updateFromEntry(doc: PageDoc, mainId: string, entry: LibraryEntry, entryId: string, version: number): PageDoc {
  let nodes = keyLooks(doc.nodes, mainId)
  const mains = looksOf(nodes, nodes[mainId] as ElementNode)
  const name = mains[0]!.attrs[COMPONENT_ATTR]!
  const single = mains.length === 1 && entry.looks.length === 1
  let last = mains.at(-1)!
  for (const look of entry.looks) {
    const mine = mains.find((main) => single || lookName(main) === lookName(look.nodes[look.topId] as ElementNode))
    const link = { [COMPONENT_ATTR]: name, [LIBRARY_ATTR]: `${entryId}@${version}` }
    if (!mine?.parentId) { // a look the page doesn't have yet
      const top = createId()
      nodes = insertSubtree(nodes, rebuild(look, top, () => undefined, link), top, last.parentId!, indexInParent(nodes, last.id) + 1)
      last = nodes[top] as ElementNode
      continue
    }
    const ids = new Map(collectSubtreeIds(nodes, mine.id).flatMap((id) => { const key = (nodes[id] as ElementNode).attrs?.[KEY_ATTR]; return key ? [[key, id] as const] : [] }))
    const fresh = rebuild(look, mine.id, (key) => ids.get(key), mine.attrs[VARIANT_ATTR] ? { ...link, [VARIANT_ATTR]: mine.attrs[VARIANT_ATTR] } : link)
    const at = indexInParent(nodes, mine.id)
    nodes = insertSubtree(removeNode(nodes, mine.id), fresh, mine.id, mine.parentId, at)
  }
  return { ...doc, nodes, css: withCss(doc.css, entryId, entry.css), links: withLinks(doc, entry.links) }
}
