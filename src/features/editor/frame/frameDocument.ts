import { escapeAttr, escapeRawTag } from '../model/serialize/escape'
import { scriptTag } from '../model/serialize/buildPage'
import { buildOverrideCss, wrapUserCss } from '../model/serialize/styleSheets'
import { runsWhileEditing } from '../model/scripts'
import type { NodeMap, PageDoc } from '../model/types'
import { NODE_ATTR } from './frameRenderer'

export const PAGE_STYLE_ID = 'fe-page-css'
export const EDITS_STYLE_ID = 'fe-edits-css'

/** Editor-only helpers inside the frame (never exported). */
const HELPER_CSS = `
[data-fe-hidden] { opacity: 0.25 !important; filter: grayscale(1); }
html { scroll-behavior: auto !important; }
`

/** The user's edits, targeted by data attribute (doubled for the same weight as the export). */
export function editorOverrideCss(nodes: NodeMap): string {
  return buildOverrideCss(nodes, (node) => `[${NODE_ATTR}="${node.id}"][${NODE_ATTR}="${node.id}"]`)
}

/**
 * The empty page shell the editor iframe starts from: fonts, trusted
 * style scripts (Tailwind) and CSS. The body is filled by the renderer.
 */
export function buildFrameShell(doc: PageDoc): string {
  const links = doc.links.map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`)
  const scripts = doc.scripts.filter(runsWhileEditing).map(scriptTag)
  const htmlAttrs = Object.entries(doc.htmlAttrs).map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join('')

  return [
    `<!doctype html><html${htmlAttrs}><head><meta charset="utf-8">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    ...links,
    ...scripts,
    `<style id="${PAGE_STYLE_ID}">${escapeRawTag(wrapUserCss(doc.css), 'style')}</style>`,
    `<style id="${EDITS_STYLE_ID}"></style>`,
    `<style>${HELPER_CSS}</style>`,
    '</head><body></body></html>',
  ].join('\n')
}

/**
 * Changing these needs a fresh iframe (scripts can't be "un-run").
 * Everything else is patched live.
 */
export function shellKey(doc: PageDoc): string {
  return JSON.stringify([doc.links, doc.scripts.filter(runsWhileEditing), doc.htmlAttrs])
}
