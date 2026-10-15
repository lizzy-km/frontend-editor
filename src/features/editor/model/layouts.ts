import { AUTH_PAGES } from './authPages'
import { conditionAttrs } from './conditions'
import { layoutCss, stripLayoutCss } from './layoutCss'
import { toSite } from './pageOps'
import { isDynamicPath } from './routes'
import { listPages, splitLayout, type PageInfo } from './pages'
import { htmlToChildNodes } from './parse/domToNodes'
import { getElement } from './tree/queries'
import { insertSubtree, removeNode } from './tree/treeOps'
import { isElement, type NodeMap, type PageDoc } from './types'

/**
 * Ready-made layouts: a top bar, a side menu, or both. They are ordinary boxes
 * (marked data-fe-layout) with a menu made from the site's pages, so every word
 * and color can be changed. Menu items carry each page's "who can see this".
 */
export type LayoutKind = 'top' | 'side' | 'both'

export const LAYOUT_ATTR = 'data-fe-layout'
/** On menu links: the open page is highlighted, and the menu closes after a click on phones. */
export const NAV_ATTR = 'data-fe-nav'
/** On the menu button (phones). */
export const TOGGLE_ATTR = 'data-fe-menu-toggle'
/** On a "Log out" button. */
export const SIGNOUT_ATTR = 'data-fe-signout'

const AUTH_PATHS = new Set(AUTH_PAGES.map((page) => page.path))

/** Can this page be a menu item? (Not the sign-in pages: they become Log in / Sign up buttons. Not pages that change per item.) */
export const canBeInMenu = (page: PageInfo) => !AUTH_PATHS.has(page.path) && !isDynamicPath(page.path)
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const conditionText = (page: PageInfo) =>
  Object.entries(conditionAttrs(page.access)).filter(([, value]) => value).map(([name, value]) => ` ${name}="${escape(value)}"`).join('')
const link = (page: PageInfo, extra = '') => `<a href="${escape(page.path)}" ${NAV_ATTR}${extra}${conditionText(page)}>${escape(page.title)}</a>`

/** Log in / Sign up for signed-out visitors, Log out for signed-in people. */
function accountHtml(pages: PageInfo[]): string {
  const login = pages.find((page) => page.path === '/login')
  const register = pages.find((page) => page.path === '/register')
  if (!login) return ''
  const out = 'data-fe-show="signed-out"'
  return `<div class="lay-auth"><a href="/login" ${NAV_ATTR} ${out}>Log in</a>`
    + (register ? `<a href="/register" ${NAV_ATTR} class="lay-cta" ${out}>Sign up</a>` : '')
    + `<button type="button" ${SIGNOUT_ATTR} data-fe-show="signed-in">Log out</button></div>`
}

const BURGER = `<button type="button" class="lay-burger" ${TOGGLE_ATTR} aria-label="Open the menu">☰</button>`

/** The boxes of a layout, in page order. */
export function layoutHtml(kind: LayoutKind, doc: PageDoc): string {
  const pages = listPages(doc)
  // Only the pages switched on with "Show in the menu".
  const menu = pages.filter((page) => page.inMenu && canBeInMenu(page)).map((page) => link(page)).join('')
  const brand = `<a href="/" class="lay-brand">${escape(doc.title || 'My site')}</a>`
  const account = accountHtml(pages)
  if (kind === 'top') return `<header ${LAYOUT_ATTR}="top" class="lay-top">${brand}${BURGER}<nav class="lay-menu">${menu}${account}</nav></header>`
  const side = (extra: string, inner: string) => `<aside ${LAYOUT_ATTR}="side" class="lay-side${extra}">${inner}</aside>`
  if (kind === 'side') {
    return side('', `${brand}<nav class="lay-menu">${menu}</nav>${account}`)
      + `<button type="button" ${LAYOUT_ATTR}="toggle" class="lay-fab" ${TOGGLE_ATTR} aria-label="Open the menu">☰</button>`
  }
  return `<header ${LAYOUT_ATTR}="top" class="lay-top lay-wide">${brand}${account}${BURGER}</header>${side(' lay-under', `<nav class="lay-menu">${menu}</nav>`)}`
}

const bodyOf = (doc: PageDoc) => getElement(doc.nodes, doc.rootId)!
const layoutBoxes = (nodes: NodeMap, bodyChildren: string[]) => bodyChildren.filter((id) => isElement(nodes[id]) && LAYOUT_ATTR in (nodes[id] as { attrs: object }).attrs)

/** Which layout the site has now (null = none). */
export function layoutOf(doc: PageDoc): LayoutKind | null {
  const kinds = layoutBoxes(doc.nodes, bodyOf(doc).children).map((id) => (doc.nodes[id] as { attrs: Record<string, string> }).attrs[LAYOUT_ATTR])
  if (kinds.includes('top') && kinds.includes('side')) return 'both'
  return kinds.includes('top') ? 'top' : kinds.includes('side') ? 'side' : null
}

/** The leading header / menu boxes that are not a generated layout (what "replace my header" removes). */
export function ownHeader(doc: PageDoc): string[] {
  const body = bodyOf(doc)
  return splitLayout(doc.nodes, body).before.filter((id) => !layoutBoxes(doc.nodes, [id]).length)
}

/** Takes the generated layout (boxes and CSS) away. */
export function removeLayout(doc: PageDoc): PageDoc {
  let nodes = doc.nodes
  for (const id of layoutBoxes(nodes, bodyOf(doc).children)) nodes = removeNode(nodes, id)
  return { ...doc, nodes, css: stripLayoutCss(doc.css) }
}

/** Puts a layout at the top of the site (a one-page document becomes a site first). With `replaceHeader`, the page's own header and menu go. */
export function applyLayout(start: PageDoc, kind: LayoutKind, replaceHeader: boolean): PageDoc {
  let doc = removeLayout(toSite(start))
  if (replaceHeader) for (const id of ownHeader(doc)) doc = { ...doc, nodes: removeNode(doc.nodes, id) }
  const created: NodeMap = {}
  const ids = htmlToChildNodes(layoutHtml(kind, doc), doc.rootId, created)
  let nodes = doc.nodes
  ids.forEach((id, offset) => { nodes = insertSubtree(nodes, created, id, doc.rootId, offset) })
  return { ...doc, nodes, css: `${doc.css.trim()}\n\n${layoutCss(kind)}`.trim() }
}
