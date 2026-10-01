import { headTagLines, scriptTag } from '../model/serialize/buildPage'
import { escapeAttr, escapeRawTag } from '../model/serialize/escape'
import { childrenToHtml, NODE_ID_ATTR } from '../model/serialize/nodeToHtml'
import { buildOverrideCss, wrapUserCss } from '../model/serialize/styleSheets'
import { getElement } from '../model/tree/queries'
import type { NodeMap, PageDoc } from '../model/types'
import { RUNTIME_SCRIPTS } from './runtime'

export const PAGE_STYLE_ID = 'fe-page-css'
export const EDITS_STYLE_ID = 'fe-edits-css'

/** Editor-only helpers inside the frame (never exported). */
const HELPER_CSS = `
[data-fe-hidden] { opacity: 0.25 !important; filter: grayscale(1); }
[data-fe-editing] { visibility: hidden !important; }
html { scroll-behavior: auto !important; }
`

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
export function buildEditorSource(doc: PageDoc): string {
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
    '</head>',
    `<body${attrs(bodyAttrs)}>${body ? childrenToHtml(doc.nodes, body, { withIds: true }) : ''}`,
    `<script type="application/json" id="fe-model">${safeJson({ rootId: doc.rootId, nodes: doc.nodes })}</script>`,
    ...RUNTIME_SCRIPTS.map((code) => `<script>${escapeRawTag(code, 'script')}</script>`),
    ...doc.scripts.filter((script) => !script.inHead).map(scriptTag),
    '</body></html>',
  ].join('\n')
}

/** Changing these needs a fresh frame (scripts can't be "un-run"). Everything else is patched live. */
export function sourceKey(doc: PageDoc): string {
  return JSON.stringify([doc.links, doc.scripts, doc.htmlAttrs, doc.headTags ?? [], doc.rootId])
}
