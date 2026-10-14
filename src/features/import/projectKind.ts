import { toSite } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import type { PageDoc } from '@/features/editor/model/types'

/** What someone is making: one page, or a website with several pages (shared header/footer + a page list). */
export type ProjectKind = 'page' | 'site'

/** Applies the choice: a site turns the page's header/footer into the shared layout and the rest into "Home". */
export const asKind = (doc: PageDoc, kind: ProjectKind): PageDoc => (kind === 'site' ? toSite(doc) : doc)

const STARTER_CSS = `
:root { --text: #1f1d1a; --muted: #6b645c; --accent: #e8573a; --bg: #fffdf9; }
body { margin: 0; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--text); background: var(--bg); line-height: 1.6; }
.section { max-width: 960px; margin: 0 auto; padding: 88px 24px; }
.section h1 { font-size: clamp(36px, 6vw, 64px); line-height: 1.1; margin: 0 0 16px; }
.section p { color: var(--muted); font-size: 18px; max-width: 60ch; }
.site-header, .site-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 24px; }
.site-header { border-bottom: 1px solid #eee5da; }
.site-header nav { display: flex; gap: 20px; }
.site-header a { color: var(--text); text-decoration: none; font-weight: 600; }
.site-footer { justify-content: center; color: var(--muted); font-size: 14px; border-top: 1px solid #eee5da; }`

const INTRO = `<section class="section"><h1>Your new page</h1><p>Click any text to change it. Use “Add” to put in pictures, buttons and sections, or paste a section your AI wrote.</p></section>`

/** An empty-but-friendly start: a heading and a line of text (a site also gets a header and footer shared by every page). */
export function blankDoc(kind: ProjectKind): PageDoc {
  const body = kind === 'site'
    ? `<header class="site-header"><strong>My site</strong><nav><a href="/">Home</a></nav></header>${INTRO}<footer class="site-footer">© My site</footer>`
    : INTRO
  const title = kind === 'site' ? 'My site' : 'My page'
  return asKind(parseHtmlDocument(`<!doctype html><html lang="en"><head><title>${title}</title><style>${STARTER_CSS}</style></head><body>${body}</body></html>`), kind)
}
