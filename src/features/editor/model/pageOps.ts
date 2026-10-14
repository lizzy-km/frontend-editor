import { createId } from '@/lib/ids'
import { PAGE_ATTR, PATH_ATTR, PRIVATE_ATTR, TITLE_ATTR, listPages, slugify, splitLayout, uniquePath } from './pages'
import { parsePastedCode } from './parse/parseDocument'
import { cloneSubtree } from './tree/cloneSubtree'
import { collectSubtreeIds, getElement } from './tree/queries'
import { moveNode, patchNode, removeNode } from './tree/treeOps'
import { isElement, type ElementNode, type NodeMap, type PageDoc } from './types'

/** Pure page operations on a document; actions/pageActions commits them. */

const uniqueKey = (title: string, doc: PageDoc) => {
  const keys = listPages(doc).map((page) => page.key)
  const base = slugify(title)
  let key = base
  for (let n = 2; keys.includes(key); n++) key = `${base}-${n}`
  return key
}

function container(id: string, parentId: string, attrs: Record<string, string>, children: string[]): ElementNode {
  return { id, kind: 'element', tag: 'div', parentId, attrs, styles: {}, children }
}

/** Turns a one-page document into a site: header/footer become the layout, the rest becomes "Home". */
export function toSite(doc: PageDoc): PageDoc {
  const body = getElement(doc.nodes, doc.rootId)
  if (!body || listPages(doc).length) return doc
  const { before, content } = splitLayout(doc.nodes, body)
  const first = content[0] ? body.children.indexOf(content[0]) : body.children.indexOf(before.at(-1) ?? '') + 1
  const last = content.at(-1) ? body.children.indexOf(content.at(-1)!) : first - 1
  const moved = body.children.slice(first, last + 1)
  const pageId = createId()
  const nodes: NodeMap = { ...doc.nodes }
  for (const id of moved) nodes[id] = { ...nodes[id]!, parentId: pageId }
  nodes[pageId] = container(pageId, body.id, { [PAGE_ATTR]: 'home', [PATH_ATTR]: '/', [TITLE_ATTR]: 'Home' }, moved)
  nodes[body.id] = { ...body, children: [...body.children.slice(0, first), pageId, ...body.children.slice(last + 1)] }
  return { ...doc, nodes }
}

export type NewPage = { title: string; path: string; from: 'blank' } | { title: string; path: string; from: 'code'; code: string } | { title: string; path: string; from: 'copy'; pageId: string }

const blankContent = (title: string) =>
  `<section class="page-intro"><h1>${title.replace(/</g, '&lt;')}</h1><p>Start writing here, or paste a section from your AI in “Add”.</p></section>`

/** The content of pasted code without its own header/footer (the site already has them), plus its CSS and fonts. */
function pastedContent(code: string, parentId: string) {
  const pasted = parsePastedCode({ html: code })
  const body = getElement(pasted.nodes, pasted.rootId)!
  const { content } = splitLayout(pasted.nodes, body)
  const nodes: NodeMap = {}
  for (const id of content) for (const sub of collectSubtreeIds(pasted.nodes, id)) nodes[sub] = pasted.nodes[sub]!
  for (const id of content) nodes[id] = { ...nodes[id]!, parentId }
  return { nodes, ids: content, css: pasted.css, links: pasted.links }
}

/** Adds a page after the last one (making the document a site first). Returns the new document and page id. */
export function addPage(start: PageDoc, page: NewPage): { doc: PageDoc; pageId: string } {
  let doc = toSite(start)
  const body = getElement(doc.nodes, doc.rootId)!
  const pages = listPages(doc)
  const pageId = createId()
  const attrs = { [PAGE_ATTR]: uniqueKey(page.title, doc), [PATH_ATTR]: uniquePath(page.path || page.title, pages.map((p) => p.path)), [TITLE_ATTR]: page.title.trim() || 'New page' }
  let nodes: NodeMap = { ...doc.nodes }
  let children: string[] = []

  if (page.from === 'copy' && nodes[page.pageId]) {
    const copy = cloneSubtree(nodes, page.pageId)
    const top = copy.nodes[copy.topId] as ElementNode
    for (const id of top.children) copy.nodes[id] = { ...copy.nodes[id]!, parentId: pageId }
    nodes = { ...nodes, ...copy.nodes }
    delete nodes[copy.topId]
    children = top.children
  } else if (page.from === 'code') {
    const pasted = pastedContent(page.code, pageId)
    nodes = { ...nodes, ...pasted.nodes }
    children = pasted.ids
    const css = pasted.css.trim() && !doc.css.includes(pasted.css.trim()) ? `${doc.css}\n\n/* ${attrs[TITLE_ATTR]} page */\n${pasted.css.trim()}` : doc.css
    doc = { ...doc, css, links: [...new Set([...doc.links, ...pasted.links])] }
  } else {
    const parsed = parsePastedCode({ html: blankContent(attrs[TITLE_ATTR]!) })
    const parsedBody = getElement(parsed.nodes, parsed.rootId)!
    for (const id of parsedBody.children) for (const sub of collectSubtreeIds(parsed.nodes, id)) nodes[sub] = parsed.nodes[sub]!
    children = parsedBody.children.filter((id) => isElement(parsed.nodes[id]))
    for (const id of children) nodes[id] = { ...nodes[id]!, parentId: pageId }
  }

  nodes[pageId] = container(pageId, body.id, attrs, children)
  const lastPage = body.children.lastIndexOf(pages.at(-1)!.id)
  nodes[body.id] = { ...body, children: [...body.children.slice(0, lastPage + 1), pageId, ...body.children.slice(lastPage + 1)] }
  return { doc: { ...doc, nodes }, pageId }
}

/** New name, address or "signed-in only" for a page. Addresses stay unique. */
export function updatePage(doc: PageDoc, pageId: string, change: { title?: string; path?: string; private?: boolean }): PageDoc {
  const others = listPages(doc).filter((page) => page.id !== pageId).map((page) => page.path)
  const nodes = patchNode<ElementNode>(doc.nodes, pageId, (node) => {
    const attrs = { ...node.attrs }
    if (change.title !== undefined) attrs[TITLE_ATTR] = change.title.trim() || 'Page'
    if (change.path !== undefined) attrs[PATH_ATTR] = uniquePath(change.path, others)
    if (change.private === true) attrs[PRIVATE_ATTR] = ''
    if (change.private === false) delete attrs[PRIVATE_ATTR]
    return { ...node, attrs }
  })
  return { ...doc, nodes }
}

/** Removes a page and everything on it (a site keeps at least one page). */
export function deletePage(doc: PageDoc, pageId: string): PageDoc {
  return listPages(doc).length > 1 ? { ...doc, nodes: removeNode(doc.nodes, pageId) } : doc
}

/** Moves a page one place up (-1) or down (+1) in the page list. */
export function movePage(doc: PageDoc, pageId: string, direction: -1 | 1): PageDoc {
  const pages = listPages(doc)
  const index = pages.findIndex((page) => page.id === pageId)
  const target = pages[index + direction]
  const body = getElement(doc.nodes, doc.rootId)
  if (!target || !body) return doc
  const at = body.children.indexOf(target.id) + (direction === 1 ? 1 : 0)
  return { ...doc, nodes: moveNode(doc.nodes, pageId, body.id, at) }
}
