import { getElement } from '../tree/queries'
import type { PageDoc, PageScript } from '../types'
import { escapeAttr, escapeRawTag } from './escape'
import { childrenToHtml, nodeToHtml, styleClassFor } from './nodeToHtml'
import { buildOverrideCss, wrapUserCss } from './styleSheets'

/** The page split into the pieces every export format is built from. */
export type PageParts = {
  title: string
  htmlAttrs: string
  bodyAttrs: string
  bodyHtml: string
  css: string
  links: string[]
  headScripts: PageScript[]
  bodyScripts: PageScript[]
}

function attrsToString(attrs: Record<string, string>): string {
  return Object.entries(attrs).map(([name, value]) => ` ${name}="${escapeAttr(value)}"`).join('')
}

/**
 * Builds export pieces for the whole page, or only one section/element when
 * `onlyId` is given (the <body> classes are kept so it still looks the same).
 */
export function buildPageParts(doc: PageDoc, onlyId?: string): PageParts {
  const body = getElement(doc.nodes, doc.rootId)
  const options = { extraClass: styleClassFor }
  const bodyHtml = !body ? '' : onlyId && onlyId !== doc.rootId
    ? nodeToHtml(doc.nodes, onlyId, options)
    : childrenToHtml(doc.nodes, body, options)

  const bodyClass = body ? styleClassFor(body) : undefined
  const bodyAttrs = { ...body?.attrs }
  if (bodyClass) bodyAttrs.class = bodyAttrs.class ? `${bodyAttrs.class} ${bodyClass}` : bodyClass

  // Doubled class = higher specificity, so edits also beat Tailwind's
  // utilities, which the Tailwind CDN injects after our <style> at runtime.
  const rules = buildOverrideCss(doc.nodes, (node) => `.fe-${node.id}.fe-${node.id}`)
  const overrides = rules && `/* Your edits */\n${rules}`
  return {
    title: doc.title,
    htmlAttrs: attrsToString(doc.htmlAttrs),
    bodyAttrs: attrsToString(bodyAttrs),
    bodyHtml,
    css: [wrapUserCss(doc.css), overrides].filter(Boolean).join('\n\n'),
    links: doc.links,
    headScripts: doc.scripts.filter((script) => script.inHead),
    bodyScripts: doc.scripts.filter((script) => !script.inHead),
  }
}

export function scriptTag(script: PageScript): string {
  const type = script.type ? ` type="${escapeAttr(script.type)}"` : ''
  if (script.src) return `<script${type} src="${escapeAttr(script.src)}"></script>`
  return `<script${type}>${escapeRawTag(script.code ?? '', 'script')}</script>`
}

/** One self-contained HTML file: CSS and JS inlined. */
export function partsToSingleFile(parts: PageParts): string {
  const links = parts.links.map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`)
  return [
    '<!doctype html>',
    `<html${parts.htmlAttrs}>`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${parts.title.replace(/</g, '&lt;')}</title>`,
    ...links,
    ...parts.headScripts.map(scriptTag),
    parts.css ? `<style>\n${escapeRawTag(parts.css, 'style')}\n</style>` : '',
    '</head>',
    `<body${parts.bodyAttrs}>`,
    parts.bodyHtml,
    ...parts.bodyScripts.map(scriptTag),
    '</body>',
    '</html>',
  ].filter(Boolean).join('\n')
}
