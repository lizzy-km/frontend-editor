import { stringifyStyle } from '../parse/parseStyle'
import { getElement } from '../tree/queries'
import type { PageDoc } from '../types'
import { escapeAttr, escapeRawTag } from './escape'
import { scriptTag } from './buildPage'
import { childrenToHtml, HIDDEN_MARK } from './nodeToHtml'

const attrs = (values: Record<string, string>) =>
  Object.entries(values).map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${escapeAttr(value)}"`)).join('')

/** <body …> with its Computer-view edits written as style="…". */
function bodyOpenTag(doc: PageDoc): string {
  const body = getElement(doc.nodes, doc.rootId)
  const values = { ...body?.attrs }
  const desktop = body?.styles.desktop
  if (desktop && Object.keys(desktop).length > 0) values.style = stringifyStyle(desktop)
  if (body?.hidden) values[HIDDEN_MARK] = ''
  return `<body${attrs(values)}>`
}

/**
 * The whole page as ONE editable source — the same shape people paste:
 * head (title, meta, links, scripts, <style> with the page CSS), body, and
 * body scripts. It parses back with parseHtmlDocument, so editing it updates
 * the HTML, CSS and JavaScript together.
 */
export function docToEditableSource(doc: PageDoc): string {
  const body = getElement(doc.nodes, doc.rootId)
  const headScripts = doc.scripts.filter((script) => script.inHead)
  const bodyScripts = doc.scripts.filter((script) => !script.inHead)
  return [
    '<!doctype html>',
    `<html${attrs(doc.htmlAttrs)}>`,
    '<head>',
    ...(doc.headTags ?? []).map(({ tag, attrs: values }) => `<${tag}${attrs(values)}>`),
    `<title>${doc.title.replace(/</g, '&lt;')}</title>`,
    ...doc.links.map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`),
    ...headScripts.map(scriptTag),
    doc.css ? `<style>\n${escapeRawTag(doc.css, 'style')}\n</style>` : '',
    '</head>',
    // One unbroken string: the HTML parser moves any whitespace around body
    // scripts or after </body> INTO the body, so newlines here would pile up
    // as blank lines every time the code is applied.
    bodyOpenTag(doc) + (body ? childrenToHtml(doc.nodes, body, { forEditing: true }) : '') +
      bodyScripts.map(scriptTag).join('') + '</body></html>',
  ].filter(Boolean).join('\n')
}
