import { describe, expect, it } from 'vitest'
import { addAuthPages } from './authPages'
import { applyLayout, layoutHtml, layoutOf, ownHeader, removeLayout } from './layouts'
import { addPage, updatePage } from './pageOps'
import { listPages } from './pages'
import { parseHtmlDocument } from './parse/parseDocument'

const site = () => {
  let doc = parseHtmlDocument('<html><head><title>Bakery</title></head><body><header class="top"><a href="/">Old header</a></header><section>Bread</section><footer>Bye</footer></body></html>')
  doc = addPage(doc, { title: 'Shop', path: '/shop', from: 'blank' }).doc
  const account = addPage(doc, { title: 'Account', path: '/account', from: 'blank' })
  return addAuthPages(updatePage(account.doc, account.pageId, { private: true }))
}

describe('layouts', () => {
  it('builds a menu from the pages, without the sign-in pages, keeping who can see each', () => {
    const html = layoutHtml('top', site())
    expect(html).toContain('>Home</a>')
    expect(html).toContain('>Shop</a>')
    expect(html).toContain('href="/account" data-fe-nav data-fe-show="signed-in"')
    expect(html).not.toContain('>Forgot password</a>')
    expect(html).toContain('data-fe-menu-toggle')
    expect(html).toContain('data-fe-signout data-fe-show="signed-in"')
    expect(html).toContain('>Sign up</a>')
  })

  it('has no account links without a log in page', () => {
    const plain = addPage(parseHtmlDocument('<body><h1>Hi</h1></body>'), { title: 'Shop', path: '/shop', from: 'blank' }).doc
    expect(layoutHtml('side', plain)).not.toContain('data-fe-signout')
  })

  it('applies each layout, replaces the old header, and reports which one it is', () => {
    for (const [kind, boxes] of [['top', 1], ['side', 2], ['both', 2]] as const) {
      const doc = applyLayout(site(), kind, true)
      expect(layoutOf(doc), kind).toBe(kind)
      expect(doc.css).toContain('/* tweak-layout */')
      expect(doc.css).toContain(kind === 'top' ? '.lay-top' : '.lay-side')
      const body = doc.nodes[doc.rootId] as { children: string[] }
      expect(body.children.filter((id) => 'data-fe-layout' in ((doc.nodes[id] as { attrs?: object }).attrs ?? {})), kind).toHaveLength(boxes)
      expect(ownHeader(doc)).toHaveLength(0)
      expect(Object.values(doc.nodes).some((node) => node.kind === 'text' && node.text === 'Old header'), kind).toBe(false)
    }
  })

  it('keeps the own header when asked, swaps layouts without piling up, and removes cleanly', () => {
    const kept = applyLayout(site(), 'top', false)
    expect(Object.values(kept.nodes).some((node) => node.kind === 'text' && node.text === 'Old header')).toBe(true)
    const swapped = applyLayout(kept, 'side', false)
    expect(layoutOf(swapped)).toBe('side')
    expect(swapped.css.match(/\/\* tweak-layout \*\//g)).toHaveLength(1)
    expect(swapped.css).not.toContain('.lay-top {')
    const removed = removeLayout(swapped)
    expect(layoutOf(removed)).toBeNull()
    expect(removed.css).not.toContain('tweak-layout')
    expect(listPages(removed)).toHaveLength(listPages(site()).length)
  })

  it('turns a one-page document into a site', () => {
    const doc = applyLayout(parseHtmlDocument('<body><h1>Hi</h1></body>'), 'top', false)
    expect(listPages(doc)).toHaveLength(1)
    expect(layoutOf(doc)).toBe('top')
  })
})
