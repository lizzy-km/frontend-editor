import { addSource } from '@/features/editor/model/data'
import { conditionAttrs, type Condition } from '@/features/editor/model/conditions'
import { applyLayout, type LayoutKind } from '@/features/editor/model/layouts'
import { addAuthPages } from '@/features/editor/model/authPages'
import { addPage, toSite } from '@/features/editor/model/pageOps'
import { MENU_ATTR, listPages } from '@/features/editor/model/pages'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { patchNode } from '@/features/editor/model/tree/treeOps'
import { isElement, type DataSource, type ElementNode, type PageDoc } from '@/features/editor/model/types'
import { UI_ATTR, type WidgetKind } from '@/features/editor/model/widgets/attrs'
import { addWidgetCss } from '@/features/editor/model/widgets/css'
import { WIDGET_GROUPS, type BlockContext } from '@/features/editor/model/widgets/registry'

/** One page of an example site. `html` is the page's content only (the header and footer are shared). It may carry its own `<style>`. */
export type SitePage = { title: string; path: string; html: string; inMenu?: boolean; /** Who may open it (default: everyone). */ access?: Condition }

export type SiteSpec = {
  title: string
  lang?: string
  /** Theme CSS for the whole site (variables, fonts, shared looks). */
  css: string
  /** Stylesheet addresses (web fonts). */
  links?: string[]
  /** The home page's content. */
  home: string
  /** A `<footer>` shared by every page. */
  footer?: string
  /** The other pages, after home. */
  pages: SitePage[]
  /** Data sources the site uses (names must match the `data-fe-list` / `data-fe-record` / filter attributes). */
  data?: Omit<DataSource, 'id'>[]
  access?: { roles: string[]; flags: string[] }
  /** The shared top bar made by the editor (default 'top'); null = the site brings its own header inside `home`'s siblings. */
  layout?: LayoutKind | null
  /** Add Log in, Sign up, Forgot password… pages. */
  authPages?: boolean
}

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** The HTML of a ready-made widget block (see Add → Inputs, tabs, tables…), e.g. `widget('tabs')` or `widget('search', { target: 'shop' })`. */
export function widget(blockId: string, context: Partial<BlockContext> = {}): string {
  const block = WIDGET_GROUPS.flatMap((group) => group.blocks).find((item) => item.id === blockId)
  if (!block) throw new Error(`There is no widget block called "${blockId}".`)
  return block.html({ target: '', ...context })
}

/**
 * Builds a whole example site as one document, the way the editor would: a home page and more pages, a shared top bar and footer,
 * data sources, the look of every widget used, roles and flags, and (optionally) the sign-in pages.
 */
export function buildSite(spec: SiteSpec): PageDoc {
  const head = `<title>${escape(spec.title)}</title>${(spec.links ?? []).map((href) => `<link rel="stylesheet" href="${escape(href)}">`).join('')}<style>${spec.css}</style>`
  let doc = toSite(parseHtmlDocument(`<!doctype html><html lang="${spec.lang ?? 'en'}"><head><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>${spec.home}${spec.footer ?? ''}</body></html>`))
  for (const page of spec.pages) doc = addPage(doc, { title: page.title, path: page.path, from: 'code', code: page.html }).doc
  for (const source of spec.data ?? []) doc = addSource(doc, source).doc
  // Pages listed in the menu: home and every page that says so.
  const inMenu = new Set(['/', ...spec.pages.filter((page) => page.inMenu !== false).map((page) => page.path)])
  let nodes = doc.nodes
  const access = new Map(spec.pages.filter((page) => page.access).map((page) => [page.path, conditionAttrs(page.access!)]))
  for (const page of listPages({ ...doc, nodes })) {
    const extra = Object.fromEntries(Object.entries(access.get(page.path) ?? {}).filter(([, value]) => value))
    nodes = patchNode<ElementNode>(nodes, page.id, (node) => ({ ...node, attrs: { ...node.attrs, ...extra, ...(inMenu.has(page.path) ? { [MENU_ATTR]: 'show' } : {}) } }))
  }
  doc = { ...doc, title: spec.title, nodes, ...(spec.access ? { access: spec.access } : {}) }
  // The look of every widget on the site, once each.
  const kinds = new Set(Object.values(doc.nodes).flatMap((node) => (isElement(node) && node.attrs[UI_ATTR] ? [node.attrs[UI_ATTR] as WidgetKind] : [])))
  for (const kind of kinds) doc = { ...doc, css: addWidgetCss(doc.css, kind) }
  if (spec.layout !== null) doc = applyLayout(doc, spec.layout ?? 'top', false)
  return spec.authPages ? addAuthPages(doc) : doc
}
