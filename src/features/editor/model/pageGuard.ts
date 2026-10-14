import { visibleTo, type Viewer } from './conditions'
import { listPages, resolvePage } from './pages'
import type { PageDoc } from './types'

/** What a viewer gets when they open a page (the Preview and public-view version of the React export's route guards). */
export type GuardResult =
  | { pageId: string | null; notice?: undefined }
  | { pageId: null; notice: 'login' | 'no-access' }

/**
 * Pages only some visitors may open: a signed-out visitor is sent to the site's
 * /login page (a notice when there is none), a signed-in person without the role
 * or flag gets "No access", and signed-out-only pages (log in, register) send
 * signed-in people to the first page.
 */
export function guardPage(doc: PageDoc, pageId: string | null, viewer: Viewer): GuardResult {
  const pages = listPages(doc)
  const page = resolvePage(doc, pageId)
  if (!page || visibleTo(page.access, viewer)) return { pageId: page?.id ?? pageId }
  if (page.access.audience === 'signed-out') {
    const home = pages.find((other) => visibleTo(other.access, viewer))
    return home ? { pageId: home.id } : { pageId: null, notice: 'no-access' }
  }
  if (!viewer.signedIn && page.access.audience === 'signed-in') {
    const login = pages.find((other) => other.path === '/login' && visibleTo(other.access, viewer))
    return login ? { pageId: login.id } : { pageId: null, notice: 'login' }
  }
  return { pageId: null, notice: 'no-access' }
}

/** A plain page for the two notices (Preview and the public view have no router to show one). */
export const noticeHtml = (notice: 'login' | 'no-access') => {
  const [title, text] = notice === 'login'
    ? ['Please log in', 'This page is for signed-in people. Add a Log in page (Pages → Add sign-in pages) and visitors are sent there.']
    : ['No access', 'Your account can’t open this page. Ask an admin if you think it should.']
  return `<!doctype html><meta charset="utf-8"><body style="font: 16px/1.5 system-ui, sans-serif; display: grid; place-items: center; min-height: 80vh; text-align: center; color: #1c1917"><main><h1>${title}</h1><p>${text}</p></main>`
}
