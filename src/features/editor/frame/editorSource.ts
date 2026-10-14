import { headTagLines, scriptTag } from '../model/serialize/buildPage'
import { escapeAttr, escapeRawTag } from '../model/serialize/escape'
import { childrenToHtml, NODE_ID_ATTR } from '../model/serialize/nodeToHtml'
import { buildOverrideCss, wrapUserCss } from '../model/serialize/styleSheets'
import { withoutLocalFiles } from '../model/serialize/localFiles'
import { hiddenFor, VISITOR, type Viewer } from '../model/conditions'
import { isPageNode, resolvePage } from '../model/pages'
import { getElement } from '../model/tree/queries'
import type { NodeMap, PageDoc } from '../model/types'
import { RUNTIME_SCRIPTS } from './runtime'

export const PAGE_STYLE_ID = 'fe-page-css'
export const EDITS_STYLE_ID = 'fe-edits-css'
/** Editor-only: which page of a multi-page site is shown. */
export const VIEW_STYLE_ID = 'fe-view-css'

/** Editor-only helpers inside the frame (never exported). */
const HELPER_CSS = `
[data-fe-hidden] { opacity: 0.25 !important; filter: grayscale(1); }
[data-fe-editing] { visibility: hidden !important; }
html { scroll-behavior: auto !important; }
[data-fe-page] { display: contents; }
`

/** Shows only the current page of a site (the others stay in the DOM, hidden). */
export function viewCss(doc: PageDoc, pageId: string | null, viewer: Viewer = VISITOR): string {
  const page = resolvePage(doc, pageId)
  const pages = page ? `[data-fe-page]:not([${NODE_ID_ATTR}="${page.id}"]) { display: none !important; }` : ''
  // "Viewing as": hide what this viewer can't see (pages stay: the one being edited is always shown).
  const hidden = hiddenFor(doc.nodes, viewer).filter((id) => !isPageNode(doc.nodes[id]))
  const who = hidden.length ? `${hidden.map((id) => `[${NODE_ID_ATTR}="${id}"]`).join(',')} { display: none !important; }` : ''
  return [pages, who].filter(Boolean).join('\n')
}

/** The user's edits, targeted by data attribute (doubled for the same weight as the export). */
export function editorOverrideCss(nodes: NodeMap): string {
  return buildOverrideCss(nodes, (node) => `[${NODE_ID_ATTR}="${node.id}"][${NODE_ID_ATTR}="${node.id}"]`)
}

const attrs = (values: Record<string, string>) =>
  Object.entries(values).map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${escapeAttr(value)}"`)).join('')

/** JSON inside <script>: "<" escaped so the page text can't close the tag. */
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

/**
 * The editor frame's page: the same page as Preview — fonts, CSS and ALL of
 * the page's scripts — plus data-fe-id markers, the model (JSON) and the
 * runtime, which runs after the body is parsed and before the page scripts.
 */
export function buildEditorSource(pageDoc: PageDoc): string {
  const doc = withoutLocalFiles(pageDoc) // files that weren't pasted would load from Tweak's own server
  const body = getElement(doc.nodes, doc.rootId)
  const bodyAttrs = { ...body?.attrs, [NODE_ID_ATTR]: doc.rootId }
  return [
    `<!doctype html><html${attrs(doc.htmlAttrs)}><head><meta charset="utf-8">`,
    ...headTagLines(doc),
    `<title>${doc.title.replace(/</g, '&lt;')}</title>`,
    ...doc.links.map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`),
    ...doc.scripts.filter((script) => script.inHead).map(scriptTag),
    `<style id="${PAGE_STYLE_ID}">${escapeRawTag(wrapUserCss(doc.css), 'style')}</style>`,
    `<style id="${EDITS_STYLE_ID}">${escapeRawTag(editorOverrideCss(doc.nodes), 'style')}</style>`,
    `<style>${HELPER_CSS}</style>`,
    `<style id="${VIEW_STYLE_ID}"></style>`,
    '</head>',
    `<body${attrs(bodyAttrs)}>${body ? childrenToHtml(doc.nodes, body, { withIds: true }) : ''}`,
    `<script type="application/json" id="fe-model">${safeJson({ rootId: doc.rootId, nodes: doc.nodes, data: dataForFrame(doc) })}</script>`,
    ...RUNTIME_SCRIPTS.map((code) => `<script>${escapeRawTag(code, 'script')}</script>`),
    ...doc.scripts.filter((script) => !script.inHead).map(scriptTag),
    '</body></html>',
  ].join('\n')
}

/** The data the frame needs for live lists: names and rows only. */
export const dataForFrame = (doc: PageDoc) => (doc.data ?? []).map((source) => ({ name: source.name, rows: source.rows }))

/** Changing these needs a fresh frame (scripts can't be "un-run"). Everything else is patched live. */
export function sourceKey(doc: PageDoc): string {
  return JSON.stringify([doc.links, doc.scripts, doc.htmlAttrs, doc.headTags ?? [], doc.rootId])
}
