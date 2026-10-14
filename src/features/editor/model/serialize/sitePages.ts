import { isPageNode, listPages, resolvePage } from '../pages'
import { collectSubtreeIds, getElement } from '../tree/queries'
import { isElement, type NodeMap, type PageDoc } from '../types'

/**
 * Turning a site into plain pages for Preview and downloads. The page
 * containers are unwrapped: what is left is a normal one-page document.
 */

/** "/" -> "index.html", "/about" -> "about.html", "/shop/new" -> "shop-new.html" (downloads). */
export function pageFileName(path: string): string {
  const name = path.split('/').filter(Boolean).join('-')
  return `${name || 'index'}.html`
}

/** Links to site pages point at their files ("/about" -> "about.html"), so a downloaded site works offline. */
function linkToFiles(nodes: NodeMap, paths: Map<string, string>): NodeMap {
  const next: NodeMap = { ...nodes }
  for (const node of Object.values(nodes)) {
    if (!isElement(node) || node.tag !== 'a') continue
    const target = paths.get(node.attrs.href ?? '')
    if (target) next[node.id] = { ...node, attrs: { ...node.attrs, href: target } }
  }
  return next
}

/** The document with page containers replaced by their content: every page (keep) or one page. */
function unwrap(doc: PageDoc, keep: (pageId: string) => boolean): PageDoc {
  const body = getElement(doc.nodes, doc.rootId)
  if (!body) return doc
  const nodes: NodeMap = { ...doc.nodes }
  const children: string[] = []
  for (const id of body.children) {
    const node = doc.nodes[id]
    if (!isPageNode(node) || !isElement(node)) {
      children.push(id)
    } else if (keep(id)) {
      for (const child of node.children) nodes[child] = { ...nodes[child]!, parentId: body.id }
      children.push(...node.children)
      delete nodes[id]
    } else {
      for (const removed of collectSubtreeIds(doc.nodes, id)) delete nodes[removed]
    }
  }
  nodes[body.id] = { ...body, children }
  return { ...doc, nodes }
}

/** One page of a site as a normal document (the site itself when it has no pages). */
export function pageDoc(doc: PageDoc, pageId: string | null, options: { fileLinks?: boolean } = {}): PageDoc {
  const page = resolvePage(doc, pageId)
  if (!page) return doc
  const single = unwrap(doc, (id) => id === page.id)
  if (!options.fileLinks) return single
  const paths = new Map(listPages(doc).map((info) => [info.path, pageFileName(info.path)]))
  return { ...single, nodes: linkToFiles(single.nodes, paths) }
}

/** Every page's content in one document (for a stylesheet that covers all pages). */
export const allPagesDoc = (doc: PageDoc): PageDoc => unwrap(doc, () => true)
