import { beforeEach, describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { getElement, getTextContent } from '../model/tree/queries'
import { isElement } from '../model/types'
import { getDoc, useDocStore } from '../store/doc.store'
import { applyHtml, editableHtml, hasScreenSizeEdits } from './codeActions'
import { setStyle } from './styleActions'
import { toggleHidden } from './nodeActions'
import { useViewStore } from '../store/view.store'

const byTag = (tag: string) => Object.values(getDoc().nodes).find((node) => isElement(node) && node.tag === tag)!.id

describe('edit code', () => {
  beforeEach(() => {
    useViewStore.getState().setBreakpoint('desktop')
    useDocStore.getState().load(parseHtmlDocument('<body><section><h1>Hi</h1><p>One</p></section><footer>Bye</footer></body>'))
  })

  it('shows Computer-view edits as inline style and keeps hidden parts marked', () => {
    setStyle(byTag('h1'), 'color', 'red')
    toggleHidden(byTag('p'))
    const html = editableHtml(byTag('section'))
    expect(html).toBe('<section><h1 style="color: red">Hi</h1><p data-fe-hidden>One</p></section>')
  })

  it('round-trips: applying unchanged code keeps edits and hidden state', () => {
    setStyle(byTag('h1'), 'color', 'red')
    toggleHidden(byTag('p'))
    applyHtml(byTag('section'), editableHtml(byTag('section')))
    const h1 = getElement(getDoc().nodes, byTag('h1'))!
    const p = getElement(getDoc().nodes, byTag('p'))!
    expect(h1.styles.desktop).toEqual({ color: 'red' })
    expect(p.hidden).toBe(true)
    expect(p.attrs).toEqual({})
  })

  it('replaces one part with new HTML as one undo step', () => {
    const before = useDocStore.getState().past.length
    applyHtml(byTag('section'), '<section><h2>New title</h2></section><aside>Extra</aside>')
    expect(getTextContent(getDoc().nodes, getDoc().rootId)).toBe('New title Extra Bye')
    expect(useDocStore.getState().past.length).toBe(before + 1)
    useDocStore.getState().undo()
    expect(getTextContent(getDoc().nodes, getDoc().rootId)).toBe('Hi One Bye')
  })

  it('edits the whole page body', () => {
    applyHtml(getDoc().rootId, '<main>Fresh page</main>')
    expect(getTextContent(getDoc().nodes, getDoc().rootId)).toBe('Fresh page')
  })

  it('page code is the whole source and round-trips (CSS, scripts, title, edits)', () => {
    useDocStore.getState().load(parseHtmlDocument(`<!doctype html><html lang="en"><head><title>Shop</title>
      <style>h1 { color: blue }</style></head><body class="b"><h1>Hi</h1><script>console.log(1)</script></body></html>`))
    setStyle(byTag('h1'), 'font-size', '40px')
    const source = editableHtml(getDoc().rootId)
    expect(source).toContain('<style>\nh1 { color: blue }\n</style>')
    expect(source).toContain('<script>console.log(1)</script>')
    applyHtml(getDoc().rootId, source)
    const doc = getDoc()
    expect(doc.title).toBe('Shop')
    expect(doc.css).toBe('h1 { color: blue }')
    expect(doc.scripts).toEqual([{ code: 'console.log(1)', src: undefined, type: undefined, inHead: false }])
    expect(getElement(doc.nodes, byTag('h1'))!.styles.desktop).toEqual({ 'font-size': '40px' })
    expect(editableHtml(doc.rootId)).toBe(source)
  })

  it('changing CSS or JS inside the page code updates the page CSS and JS', () => {
    const source = editableHtml(getDoc().rootId).replace('</head>', '<style>p { color: green }</style></head>')
      .replace('</body>', '<script>window.x = 1</script></body>')
    applyHtml(getDoc().rootId, source)
    expect(getDoc().css).toBe('p { color: green }')
    expect(getDoc().scripts.map((script) => script.code)).toEqual(['window.x = 1'])
  })

  it("a part's own <style> and <script> join the page instead of being dropped", () => {
    applyHtml(byTag('footer'), '<footer class="f">New</footer><style>.f { color: red }</style><script>track()</script>')
    expect(getTextContent(getDoc().nodes, getDoc().rootId)).toBe('Hi One New')
    expect(getDoc().css).toContain('.f { color: red }')
    expect(getDoc().scripts.at(-1)).toMatchObject({ code: 'track()', inHead: false })
  })

  it('warns when phone/tablet edits would be lost', () => {
    expect(hasScreenSizeEdits(byTag('section'))).toBe(false)
    setStyle(byTag('h1'), 'font-size', '20px', 'mobile')
    expect(hasScreenSizeEdits(byTag('section'))).toBe(true)
  })
})
