import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { getElement } from '../model/tree/queries'
import { moveNode, patchNode, removeNode } from '../model/tree/treeOps'
import type { ElementNode, NodeMap, TextNode } from '../model/types'
import { diffNodes } from './diffNodes'
import { buildEditorSource } from './editorSource'

type Runtime = { handlers: Record<string, (payload: unknown) => unknown>; dom: Map<string, Node> }
const open: JSDOM[] = []
afterEach(() => open.splice(0).forEach((dom) => dom.window.close()))

/** Loads the editor frame's page with its scripts running, like the browser does. */
function load(html: string) {
  const doc = parseHtmlDocument(html)
  const dom = new JSDOM(buildEditorSource(doc), { runScripts: 'dangerously', pretendToBeVisual: true })
  open.push(dom)
  const fe = (dom.window as unknown as { __fe: Runtime }).__fe
  let current = doc.nodes
  const sync = (next: NodeMap) => {
    fe.handlers.sync!(diffNodes(next, current))
    current = next
  }
  return { doc, fe, sync, page: dom.window.document, body: getElement(doc.nodes, doc.rootId)! }
}

describe('editor frame', () => {
  it('renders the page with its scripts, ids and SVG', () => {
    const { page, fe, body } = load('<body class="x"><h1 id="t">Hi</h1><svg><path d="M0"/></svg>'
      + '<script>document.getElementById("t").dataset.ran = "yes"</script></body>')
    expect(page.body.className).toBe('x')
    expect(page.querySelector('h1')!.getAttribute('data-ran')).toBe('yes')
    expect(page.querySelector('path')!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(fe.dom.get(body.children[0]!)).toBe(page.querySelector('h1'))
  })

  it('keeps hidden parts on the page, marked', () => {
    const doc = parseHtmlDocument('<body><p>A</p></body>')
    const pId = getElement(doc.nodes, doc.rootId)!.children[0]!
    const nodes = patchNode<ElementNode>(doc.nodes, pId, (node) => ({ ...node, hidden: true }))
    expect(buildEditorSource({ ...doc, nodes })).toContain('data-fe-hidden')
  })

  it('patches only what changed and keeps element identity', () => {
    const { doc, page, sync, body } = load('<body><h1>Old</h1><p>Keep</p></body>')
    const heading = page.querySelector('h1')!
    const paragraph = page.querySelector('p')!
    const textId = getElement(doc.nodes, body.children[0])!.children[0]!

    sync(patchNode<TextNode>(doc.nodes, textId, (node) => ({ ...node, text: 'New' })))
    expect(heading.textContent).toBe('New')
    expect(page.querySelector('h1')).toBe(heading)
    expect(page.querySelector('p')).toBe(paragraph)
  })

  it('handles move, tag change and removal', () => {
    const { doc, page, sync, body } = load('<body><h1>A</h1><p>B</p></body>')
    const [h1Id, pId] = body.children as [string, string]

    let nodes = moveNode(doc.nodes, pId, doc.rootId, 0)
    sync(nodes)
    expect(page.body.firstElementChild!.tagName).toBe('P')

    nodes = patchNode<ElementNode>(nodes, h1Id, (node) => ({ ...node, tag: 'h2' }))
    sync(nodes)
    expect(page.querySelector('h2')!.textContent).toBe('A')

    sync(removeNode(nodes, pId))
    expect(page.querySelector('p')).toBeNull()
  })

  it('updates page CSS and edits, and marks editor-only attributes', () => {
    const { fe, page, body } = load('<body><details><summary>Q</summary>A</details></body>')
    fe.handlers.css!({ page: 'h1{color:red}', edits: 'p{color:blue}' })
    expect(page.getElementById('fe-page-css')!.textContent).toBe('h1{color:red}')
    expect(page.getElementById('fe-edits-css')!.textContent).toBe('p{color:blue}')

    const detailsId = body.children[0]!
    fe.handlers.mark!({ id: detailsId, name: 'open', on: true })
    expect(page.querySelector('details')!.hasAttribute('open')).toBe(true)
    fe.handlers.mark!({ id: detailsId, name: 'open', on: false })
    expect(page.querySelector('details')!.hasAttribute('open')).toBe(false)
  })

  it("leaves out files that weren't pasted (they'd load from Tweak's own server)", () => {
    const source = buildEditorSource(parseHtmlDocument('<html><head><script type="module" src="/src/main.tsx"></script>'
      + '<link rel="stylesheet" href="css/site.css"><script src="https://cdn.example.com/lib.js"></script></head><body><p>Hi</p></body></html>'))
    expect(source).not.toContain('/src/main.tsx')
    expect(source).not.toContain('css/site.css')
    expect(source).toContain('https://cdn.example.com/lib.js')
  })

  it('keeps page text from closing the model script', () => {
    const source = buildEditorSource(parseHtmlDocument('<body><p>&lt;/script&gt;&lt;b&gt;</p></body>'))
    const model = source.slice(source.indexOf('id="fe-model">'), source.indexOf('</script>', source.indexOf('id="fe-model">')))
    expect(model).not.toContain('<')
  })
})
