import { conditionAttrs } from '@/features/editor/model/conditions'
import { addPage, toSite } from '@/features/editor/model/pageOps'
import { MENU_ATTR, listPages } from '@/features/editor/model/pages'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { patchNode } from '@/features/editor/model/tree/treeOps'
import type { ElementNode, PageDoc } from '@/features/editor/model/types'
import type { Compiled } from './compile'
import type { CrawlResult, CrawledPage } from './crawl'

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** The pages the header links to (the menu), read from the home page's header or navigation. */
function menuPaths(home: CrawledPage): Set<string> {
  const body = new DOMParser().parseFromString(`<body>${home.html}</body>`, 'text/html')
  const links = [...body.querySelectorAll('header a[href^="/"], nav a[href^="/"]')].map((link) => link.getAttribute('href')!.split(/[?#]/)[0]!)
  return new Set(links)
}

/** A page's name: what the app set as its title (without the site name after a dash), else its first heading, else its address. */
export function titleOf(page: CrawledPage): string {
  const fromTitle = page.title.split(/\s[—–|-]\s/)[0]!.trim()
  const heading = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(page.html)?.[1]?.replace(/<[^>]+>/g, '').trim()
  return fromTitle || heading || page.path
}

/**
 * The visited pages as one Tweak site: the first page (with the app's own header and footer, which become the shared layout), then a page
 * for every other address. Changing addresses ("/shop/:id") keep the first example's content. The app's stylesheets come along as the page CSS.
 */
export function crawlToDoc(result: CrawlResult, html: Compiled['html']): PageDoc | null {
  const home = result.pages.find((page) => page.path === '/') ?? result.pages[0]
  if (!home) return null
  const head = `<title>${escape(html.title || titleOf(home))}</title>${html.links.map((href) => `<link rel="stylesheet" href="${escape(href)}">`).join('')}<style>${result.styles.join('\n')}</style>`
  let doc = toSite(parseHtmlDocument(`<!doctype html><html lang="${escape(html.lang)}"><head><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>${home.html}</body></html>`))
  const added = new Map<string, string>()
  for (const page of result.pages.filter((one) => one !== home)) {
    const made = addPage(doc, { title: titleOf(page), path: page.pattern, from: 'code', code: `<!doctype html><html><body>${page.html}</body></html>` })
    doc = made.doc
    added.set(page.path, made.pageId)
  }
  // The home page, the pages the menu links to, and members-only pages marked as such.
  const menu = menuPaths(home)
  const info = listPages(doc)
  let nodes = doc.nodes
  for (const page of info) {
    const crawled = result.pages.find((one) => (one === home ? '/' : one.pattern) === page.path)
    const extra = crawled?.private ? Object.fromEntries(Object.entries(conditionAttrs({ audience: 'signed-in', roles: [], flags: [] })).filter(([, value]) => value)) : {}
    nodes = patchNode<ElementNode>(nodes, page.id, (node) => ({ ...node, attrs: { ...node.attrs, ...extra, ...(page.path === '/' || menu.has(page.path) ? { [MENU_ATTR]: 'show' } : {}) } }))
  }
  return { ...doc, nodes, title: html.title || titleOf(home) }
}
