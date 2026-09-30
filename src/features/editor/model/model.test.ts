import { describe, expect, it } from 'vitest'
import { stripCodeFences } from './parse/cleanPaste'
import { parseHtmlDocument, parsePastedCode } from './parse/parseDocument'
import { parseStyleText } from './parse/parseStyle'
import { buildPageParts, partsToSingleFile } from './serialize/buildPage'
import { wrapUserCss } from './serialize/styleSheets'
import { cloneSubtree } from './tree/cloneSubtree'
import { getElement, getTextContent } from './tree/queries'
import { moveNode, removeNode } from './tree/treeOps'

const AI_REPLY = 'Sure! Here is your page:\n```html\n<h1 class="title">Hi</h1><p>There</p>\n```\nEnjoy!'

describe('parsing pasted code', () => {
  it('strips chat text and markdown fences', () => {
    expect(stripCodeFences(AI_REPLY)).toBe('<h1 class="title">Hi</h1><p>There</p>')
  })

  it('turns a fragment plus css/js into a page', () => {
    const doc = parsePastedCode({ html: AI_REPLY, css: 'h1 { color: red }', js: 'console.log(1)' })
    const body = getElement(doc.nodes, doc.rootId)!
    expect(body.children).toHaveLength(2)
    expect(doc.css).toContain('color: red')
    expect(doc.scripts).toEqual([{ code: 'console.log(1)', src: undefined, type: undefined, inHead: false }])
  })

  it('keeps head assets from a full document', () => {
    const doc = parseHtmlDocument(`<!doctype html><html lang="en" class="dark"><head><title>Shop</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter"></head>
      <body class="bg-gray-50"><main style="padding: 4px; background: url(data:a;b)">x</main></body></html>`)
    expect(doc.title).toBe('Shop')
    expect(doc.htmlAttrs).toEqual({ lang: 'en', class: 'dark' })
    expect(doc.links).toHaveLength(1)
    expect(doc.scripts[0]).toMatchObject({ src: 'https://cdn.tailwindcss.com', inHead: true })
    const main = Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === 'main')
    expect(main && main.kind === 'element' && main.styles.desktop).toEqual({ padding: '4px', background: 'url(data:a;b)' })
  })

  it('parses inline styles without breaking on semicolons in urls', () => {
    expect(parseStyleText('color:red; background:url("a;b")')).toEqual({ color: 'red', background: 'url("a;b")' })
  })
})

describe('tree operations', () => {
  const doc = parseHtmlDocument('<body><div id="a"><p>one</p></div><div id="b"></div></body>')
  const body = getElement(doc.nodes, doc.rootId)!
  const [aId, bId] = body.children as [string, string]

  it('moves a node into another parent', () => {
    const nodes = moveNode(doc.nodes, getElement(doc.nodes, aId)!.children[0]!, bId, 0)
    expect(getTextContent(nodes, bId)).toBe('one')
    expect(getTextContent(nodes, aId)).toBe('')
  })

  it('refuses to move a node into itself', () => {
    expect(moveNode(doc.nodes, aId, getElement(doc.nodes, aId)!.children[0]!, 0)).toBe(doc.nodes)
  })

  it('removes a whole subtree', () => {
    const nodes = removeNode(doc.nodes, aId)
    expect(Object.keys(nodes)).toHaveLength(Object.keys(doc.nodes).length - 3)
  })

  it('clones with fresh ids and no duplicate html ids', () => {
    const copy = cloneSubtree(doc.nodes, aId)
    expect(copy.topId).not.toBe(aId)
    expect(getElement(copy.nodes, copy.topId)!.attrs.id).toBeUndefined()
  })
})

describe('export', () => {
  it('round-trips html and adds classes for edits', () => {
    const doc = parseHtmlDocument('<body><a href="/x?a=1&amp;b=2" style="color: red">Go &amp; see</a></body>')
    const parts = buildPageParts(doc)
    const link = Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === 'a')!
    expect(parts.bodyHtml).toBe(`<a href="/x?a=1&amp;b=2" class="fe-${link.id}">Go &amp; see</a>`)
    expect(parts.css).toContain(`.fe-${link.id}.fe-${link.id} { color: red; }`)
    expect(partsToSingleFile(parts)).toContain('<!doctype html>')
  })

  it('keeps the page viewport and preconnect links, drops a refresh', () => {
    const doc = parseHtmlDocument(`<!doctype html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <meta name="description" content="A ceremony">
      <meta http-equiv="refresh" content="0;url=https://evil.example">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></head><body><p>x</p></body></html>`)
    const html = partsToSingleFile(buildPageParts(doc))
    expect(html).toContain('viewport-fit=cover')
    expect(html.match(/name="viewport"/g)).toHaveLength(1)
    expect(html).toContain('<meta name="description" content="A ceremony">')
    expect(html).toContain('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">')
    expect(html).not.toContain('refresh')
  })

  it('adds the default viewport when the page has none', () => {
    const html = partsToSingleFile(buildPageParts(parseHtmlDocument('<body><p>x</p></body>')))
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">')
  })

  it('wraps pasted css in a layer but keeps @import on top', () => {
    const css = wrapUserCss('@import url(x.css);\nh1{color:red}')
    expect(css.startsWith('@import url(x.css);')).toBe(true)
    expect(css).toContain('@layer page {\nh1{color:red}\n}')
  })
})
