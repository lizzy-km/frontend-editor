import { track } from '@/features/analytics/track'
import { addPage, deletePage, movePage, toSite, updatePage, type NewPage } from '../model/pageOps'
import { listPages } from '../model/pages'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { useViewStore } from '../store/view.store'
import { updateDoc } from './commit'

/** Shows another page in the editor (the selection belongs to the old one). */
export function openPage(pageId: string) {
  useSelectionStore.getState().select(null)
  useViewStore.getState().setPageId(pageId)
}

/** Turns a one-page project into a website: header/footer shared, the rest becomes "Home". Opens the Pages tab. */
export function makeSite() {
  updateDoc(toSite)
  const first = listPages(getDoc())[0]
  if (first) openPage(first.id)
  useViewStore.getState().setSidePanel('pages')
  track('make_site')
}

/** Adds a page (turning a one-page document into a site first) and opens it. One undo step. */
export function createPage(page: NewPage) {
  let created = ''
  updateDoc((doc) => {
    const result = addPage(doc, page)
    created = result.pageId
    return result.doc
  })
  track('page_add', { from: page.from, pages: listPages(getDoc()).length })
  openPage(created)
}

/** Name, address or "signed-in only". Typing in the name box is one undo step. */
export function changePage(pageId: string, change: { title?: string; path?: string; private?: boolean }) {
  updateDoc((doc) => updatePage(doc, pageId, change), `page:${pageId}:${Object.keys(change).join()}`)
}

/** Deletes a page and opens a neighbour. */
export function removePage(pageId: string) {
  const pages = listPages(getDoc())
  const index = pages.findIndex((page) => page.id === pageId)
  updateDoc((doc) => deletePage(doc, pageId))
  const next = pages[index + 1] ?? pages[index - 1]
  if (next) openPage(next.id)
}

/** Moves a page up (-1) or down (+1) in the list. */
export const reorderPage = (pageId: string, direction: -1 | 1) => updateDoc((doc) => movePage(doc, pageId, direction))
