import { getElement } from './tree/queries'
import { isElement, type ElementNode, type NodeMap, type PageDoc } from './types'

/**
 * Multi-page sites live in ONE document: everything in <body> that is not a
 * page is the shared layout (header, footer…), and each page is a container
 *   <div data-fe-page="about" data-fe-path="/about" data-fe-title="About">…</div>
 * placed where the page content goes. Containers take no space
 * (display: contents) and the editor shows one page at a time.
 */
export const PAGE_ATTR = 'data-fe-page'
export const PATH_ATTR = 'data-fe-path'
export const TITLE_ATTR = 'data-fe-title'
/** Only signed-in visitors may open the page (used by the React export's route guard). */
export const PRIVATE_ATTR = 'data-fe-private'

export type PageInfo = { id: string; key: string; path: string; title: string; private: boolean }

export const isPageNode = (node: unknown): node is ElementNode => isElement(node as ElementNode) && PAGE_ATTR in (node as ElementNode).attrs

const toInfo = (node: ElementNode): PageInfo => ({
  id: node.id,
  key: node.attrs[PAGE_ATTR]!,
  path: node.attrs[PATH_ATTR] ?? '/',
  title: node.attrs[TITLE_ATTR] ?? 'Page',
  private: PRIVATE_ATTR in node.attrs,
})

/** The pages of a site, in order (empty for a one-page document). */
export function listPages(doc: Pick<PageDoc, 'nodes' | 'rootId'>): PageInfo[] {
  const body = getElement(doc.nodes, doc.rootId)
  return (body?.children ?? []).map((id) => doc.nodes[id]).filter(isPageNode).map(toInfo)
}

export const isMultiPage = (doc: Pick<PageDoc, 'nodes' | 'rootId'>) => listPages(doc).length > 0

/** The page a node belongs to, or null when it is part of the shared layout. */
export function pageOfNode(nodes: NodeMap, id: string | null): string | null {
  for (let current = id; current; current = nodes[current]?.parentId ?? null) {
    if (isPageNode(nodes[current])) return current
  }
  return null
}

/** "About us!" -> "about-us" (page keys and addresses). */
export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '') || 'page'
}

/** A clean, unique address: "/about", "/about-2"… ("/" stays "/"). */
export function uniquePath(wanted: string, taken: string[]): string {
  const clean = wanted.trim() === '/' ? '/' : `/${wanted.split('/').filter(Boolean).map(slugify).join('/')}`
  const base = clean === '/' && taken.includes('/') ? '/page' : clean
  let path = base
  for (let n = 2; taken.includes(path); n++) path = `${base}-${n}`
  return path
}

/** Leading header/nav parts and trailing footer parts of a one-page document (they become the shared layout). */
export function splitLayout(nodes: NodeMap, body: ElementNode): { before: string[]; content: string[]; after: string[] } {
  const elements = body.children.filter((id) => isElement(nodes[id]))
  const looks = (id: string, tags: string[], words: RegExp) => {
    const node = nodes[id] as ElementNode
    return tags.includes(node.tag) || words.test(`${node.attrs.id ?? ''} ${node.attrs.class ?? ''}`)
  }
  let start = 0
  while (start < elements.length && looks(elements[start]!, ['header', 'nav'], /\b(header|nav|navbar|topbar|menu)\b/i)) start++
  let end = elements.length
  while (end > start && looks(elements[end - 1]!, ['footer'], /\bfooter\b/i)) end--
  return { before: elements.slice(0, start), content: elements.slice(start, end), after: elements.slice(end) }
}
