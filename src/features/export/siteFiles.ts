import { buildPageParts } from '@/features/editor/model/serialize/buildPage'
import { allPagesDoc, pageDoc, pageFileName } from '@/features/editor/model/serialize/sitePages'
import { listPages, resolvePage } from '@/features/editor/model/pages'
import type { PageDoc } from '@/features/editor/model/types'
import { partsToSplitFiles, type ExportFiles } from './buildFiles'

/** A page's browser-tab title: "About us · Sunny Bakery" (Home keeps the site title). */
const titled = (doc: PageDoc, page: { title: string; path: string }): PageDoc =>
  page.path === '/' ? doc : { ...doc, title: `${page.title} · ${doc.title}` }

/** The page being edited as a normal document; links to other pages point at their .html files when asked. */
export function currentPageDoc(doc: PageDoc, pageId: string | null, fileLinks = false): PageDoc {
  const page = resolvePage(doc, pageId)
  return page ? titled(pageDoc(doc, page.id, { fileLinks }), page) : doc
}

/**
 * A whole site for developers / hosting: one .html per page (index.html is
 * the home page) sharing one styles.css and script.js.
 */
export function siteToSplitFiles(doc: PageDoc): ExportFiles {
  const shared = partsToSplitFiles(buildPageParts(allPagesDoc(doc)))
  const files: ExportFiles = { ...shared }
  delete files['index.html']
  for (const page of listPages(doc)) {
    const html = partsToSplitFiles(buildPageParts(titled(pageDoc(doc, page.id, { fileLinks: true }), page)))['index.html']!
    files[pageFileName(page.path)] = html
  }
  return files
}
