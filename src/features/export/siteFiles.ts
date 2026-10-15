import { buildPageParts } from '@/features/editor/model/serialize/buildPage'
import { forVisitors } from '@/features/editor/model/serialize/forVisitors'
import { allPagesForFiles, linkToFiles, pageDoc, pageFileName } from '@/features/editor/model/serialize/sitePages'
import { VISITOR } from '@/features/editor/model/conditions'
import { guardPage } from '@/features/editor/model/pageGuard'
import { listPages, resolvePage } from '@/features/editor/model/pages'
import type { PageDoc } from '@/features/editor/model/types'
import { partsToSplitFiles, type ExportFiles } from './buildFiles'

/** A page's browser-tab title: "About us · Sunny Bakery" (Home keeps the site title). */
const titled = (doc: PageDoc, page: { title: string; path: string }): PageDoc =>
  page.path === '/' ? doc : { ...doc, title: `${page.title} · ${doc.title}` }

/** The page being edited as a normal document; links to other pages point at their .html files when asked. */
export function currentPageDoc(doc: PageDoc, pageId: string | null, fileLinks = false): PageDoc {
  // Lists from data are filled with their rows: nothing loads live in a downloaded page.
  const page = resolvePage(doc, pageId)
  const out = forVisitors(page ? titled(pageDoc(doc, page.id, { fileLinks }), page) : doc)
  // Links made from data ("/products/" + each row's id) become file links too.
  return fileLinks ? { ...out, nodes: linkToFiles(out.nodes, listPages(doc)) } : out
}

/**
 * A page a signed-out visitor may not open sends them to the log in page (or the first page they can see).
 * Static files can't keep anything secret: real protection needs the React download and your API.
 */
function withGuard(doc: PageDoc, pageId: string, html: string): string {
  const guard = guardPage(doc, pageId, VISITOR)
  const target = guard.pageId && guard.pageId !== pageId ? listPages(doc).find((page) => page.id === guard.pageId) : undefined
  if (!target) return html
  const go = `<script>document.documentElement.style.display='none';location.replace(${JSON.stringify(pageFileName(target.path))})</script>`
  return html.replace(/<head[^>]*>/i, (head) => `${head}${go}`)
}

/**
 * A whole site for developers / hosting: one .html per page (index.html is
 * the home page) sharing one styles.css and script.js.
 */
export function siteToSplitFiles(doc: PageDoc): ExportFiles {
  const shared = partsToSplitFiles(buildPageParts(forVisitors(allPagesForFiles(doc))))
  const files: ExportFiles = { ...shared }
  delete files['index.html']
  for (const page of listPages(doc)) {
    const filled = forVisitors(titled(pageDoc(doc, page.id, { fileLinks: true }), page))
    const html = partsToSplitFiles(buildPageParts({ ...filled, nodes: linkToFiles(filled.nodes, listPages(doc)) }))['index.html']!
    files[pageFileName(page.path)] = withGuard(doc, page.id, html)
  }
  return files
}
