import { describe, expect, it } from 'vitest'
import { CONTACT_FORM_HTML } from '@/features/editor/model/formBlocks'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { isElement, type ElementNode, type PageDoc } from '@/features/editor/model/types'
import { componentViews, type ComponentView } from '../componentViews'
import { applyMarkup, editBlocker, extractMarkup, type ComponentRef } from './applyJsx'
import { parseJsx } from './jsxParse'

const page = () => parseHtmlDocument(`<body><section class="hero" style="padding: 40px"><h1 style="color: #d9772b">Fresh bread</h1><p>Baked <b>daily</b> at dawn.</p><a href="/menu" class="btn">See the menu</a><img src="a.jpg" alt="Loaf"></section>
<section class="cards"><div class="card"><h3>A</h3><p>One</p></div><div class="card"><h3>B</h3><p>Two</p></div><div class="card"><h3>C</h3><p>Three</p></div></section>
${CONTACT_FORM_HTML}<footer>Bye</footer></body>`)
const view = (views: ComponentView[], test: (view: ComponentView) => boolean) => views.find(test)!
const refs = (views: ComponentView[]): ComponentRef[] => views.map(({ name, ids }) => ({ name, ids }))
const elements = (doc: PageDoc) => Object.values(doc.nodes).filter(isElement)
const edit = (doc: PageDoc, hero: ComponentView, change: (markup: string) => string) => {
  const views = componentViews(doc)
  return applyMarkup(doc, hero.ids[0]!, change(extractMarkup(hero.code)!), refs(views))
}

describe('JSX parser', () => {
  it('reads the export\'s own markup, and says what it can\'t read', () => {
    const ok = parseJsx('<div className="a" tabIndex={0} data-x="1" hidden>\n  Hello {" "}\n  <b>world</b>\n  <br />\n</div>')
    expect(ok.ok && ok.root).toMatchObject({ tag: 'div', attrs: { className: 'a', tabIndex: '0', 'data-x': '1', hidden: true } })
    expect(ok.ok && ok.root.children.map((child) => child.kind)).toEqual(['text', 'text', 'element', 'element'])
    expect(parseJsx('<div onClick={() => go()}>x</div>')).toMatchObject({ ok: false })
    expect(parseJsx('<div>{value}</div>')).toMatchObject({ ok: false, line: 1 })
    expect(parseJsx('<div><span></div>')).toMatchObject({ ok: false })
    expect(parseJsx('<Card title="x" />')).toMatchObject({ ok: false })
  })
})

describe('applying edited markup', () => {
  it('changes nothing when the code is not edited', () => {
    const doc = page()
    const views = componentViews(doc)
    for (const each of views.filter((candidate) => !editBlocker(candidate.code))) {
      const result = applyMarkup(doc, each.ids[0]!, extractMarkup(each.code)!, refs(views))
      expect(result.ok, each.name).toBe(true)
      if (result.ok) expect(result.doc.nodes, each.name).toEqual(doc.nodes)
    }
  })

  it('edits words and attributes, keeping ids and styles', () => {
    const doc = page()
    const hero = view(componentViews(doc), (candidate) => candidate.code.includes('Fresh bread'))
    const before = elements(doc).find((node) => node.tag === 'h1')!
    const result = edit(doc, hero, (markup) => markup.replace('Fresh bread', 'Warm bread').replace('See the menu', 'Order now').replace('alt="Loaf"', 'alt="A loaf"'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const h1 = result.doc.nodes[before.id] as ElementNode
    expect(h1.styles).toEqual(before.styles) // the heading's color stays
    const text = (id: string) => (result.doc.nodes[id] as { text: string }).text
    expect(text(h1.children[0]!)).toBe('Warm bread')
    expect(elements(result.doc).find((node) => node.tag === 'img')!.attrs.alt).toBe('A loaf')
    expect(elements(result.doc).find((node) => node.tag === 'a')!.attrs).toMatchObject({ href: '/menu', class: 'btn' })
  })

  it('adds, removes and moves elements; new ones are plain, old ones keep their look', () => {
    const doc = page()
    const hero = view(componentViews(doc), (candidate) => candidate.code.includes('Fresh bread'))
    const result = edit(doc, hero, (markup) => markup.replace(/<p>[\s\S]*?<\/p>/, '<p>Short text</p>\n      <h2>New heading</h2>'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const heroNode = elements(result.doc).find((node) => node.attrs.class === 'hero')!
    const tags = heroNode.children.map((id) => (result.doc.nodes[id] as ElementNode).tag)
    expect(tags).toEqual(['h1', 'p', 'h2', 'a', 'img'])
    expect(elements(result.doc).some((node) => node.tag === 'b')).toBe(false) // removed with the old paragraph's content
    expect(heroNode.styles.desktop).toEqual({ padding: '40px' })
  })

  it('keeps repeated cards and forms as blocks, and reports what cannot be added', () => {
    const doc = page()
    const views = componentViews(doc)
    const cards = view(views, (candidate) => candidate.code.includes('Items.map'))
    expect(editBlocker(cards.code)).toBeNull()
    const kept = edit(doc, cards, (markup) => markup.replace('<section', '<section id="menu"').replace(/\s*\{\w+\.map/, '\n      <h2>Menu</h2>\n      {cardItems.map'))
    expect(kept.ok).toBe(true)
    if (kept.ok) {
      expect(elements(kept.doc).filter((node) => node.attrs.class === 'card')).toHaveLength(3)
      expect(elements(kept.doc).find((node) => node.tag === 'section' && node.attrs.id === 'menu')).toBeTruthy()
    }
    const removed = edit(doc, cards, (markup) => markup.replace(/\s*\{\w+\.map[^\n]*/, ''))
    expect(removed.ok && elements(removed.doc).filter((node) => node.attrs.class === 'card')).toHaveLength(0)
    const added = edit(doc, cards, (markup) => `${markup.slice(0, -'</section>'.length)}<Card />\n</section>`)
    expect(added.ok).toBe(false)
  })

  it('refuses code it cannot turn into markup, naming the line', () => {
    const doc = page()
    const hero = view(componentViews(doc), (candidate) => candidate.code.includes('Fresh bread'))
    const result = edit(doc, hero, (markup) => markup.replace('<h1', '<h1 onClick={() => alert(1)}'))
    expect(result).toMatchObject({ ok: false })
    expect(!result.ok && result.error).toContain('onClick')
    expect(edit(doc, hero, (markup) => markup.replace('<section', '<div').replace(/<\/section>$/, '</div>'))).toMatchObject({ ok: false })
  })
})
