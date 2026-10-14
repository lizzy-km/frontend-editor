import { describe, expect, it } from 'vitest'
import { addPage, deletePage, movePage, toSite, updatePage } from './pageOps'
import { listPages, pageOfNode, uniquePath } from './pages'
import { parseHtmlDocument } from './parse/parseDocument'
import { getElement, getTextContent } from './tree/queries'
import { isElement } from './types'

const PAGE = '<body><header class="site-header"><a href="/">Logo</a></header><section class="hero"><h1>Hello</h1></section><section class="more">More</section><footer>Bye</footer></body>'
const tags = (doc: ReturnType<typeof parseHtmlDocument>, id: string) => getElement(doc.nodes, id)!.children.filter((c) => isElement(doc.nodes[c])).map((c) => getElement(doc.nodes, c)!.attrs.class ?? getElement(doc.nodes, c)!.tag)

describe('pages', () => {
  it('turns a page into a site: header and footer become the layout, the rest is Home', () => {
    const site = toSite(parseHtmlDocument(PAGE))
    const [home] = listPages(site)
    expect(home).toMatchObject({ key: 'home', path: '/', title: 'Home', private: false })
    expect(tags(site, site.rootId)).toEqual(['site-header', 'div', 'footer'])
    expect(tags(site, home!.id)).toEqual(['hero', 'more'])
  })

  it('adds blank, pasted and copied pages with unique addresses', () => {
    let { doc } = addPage(parseHtmlDocument(PAGE), { title: 'About us', path: '', from: 'blank' })
    const blank = listPages(doc)[1]!
    expect(blank).toMatchObject({ key: 'about-us', path: '/about-us', title: 'About us' })
    expect(getTextContent(doc.nodes, blank.id)).toContain('About us')

    ;({ doc } = addPage(doc, { title: 'Prices', path: 'prices', from: 'code', code: '<style>.p{color:red}</style><header>Other header</header><main class="p">Plans</main><footer>x</footer>' }))
    const pasted = listPages(doc)[2]!
    expect(tags(doc, pasted.id)).toEqual(['p']) // its own header/footer are dropped: the site has them
    expect(doc.css).toContain('.p{color:red}')

    ;({ doc } = addPage(doc, { title: 'About us', path: '/about-us', from: 'copy', pageId: blank.id }))
    expect(listPages(doc)[3]).toMatchObject({ key: 'about-us-2', path: '/about-us-2' })
    expect(getTextContent(doc.nodes, listPages(doc)[3]!.id)).toContain('About us')
  })

  it('renames, moves, protects and deletes pages', () => {
    const added = addPage(parseHtmlDocument(PAGE), { title: 'Contact', path: '/contact', from: 'blank' })
    const pageId = added.pageId
    let doc = added.doc
    doc = updatePage(doc, pageId, { title: 'Say hi', path: '/', private: true })
    expect(listPages(doc)[1]).toMatchObject({ title: 'Say hi', path: '/page', private: true }) // "/" belongs to Home
    doc = movePage(doc, pageId, -1)
    expect(listPages(doc).map((page) => page.title)).toEqual(['Say hi', 'Home'])
    doc = deletePage(doc, pageId)
    expect(listPages(doc)).toHaveLength(1)
    expect(deletePage(doc, listPages(doc)[0]!.id)).toBe(doc) // the last page stays
  })

  it('knows which page a node is on (null = shared layout)', () => {
    const site = toSite(parseHtmlDocument(PAGE))
    const home = listPages(site)[0]!
    const hero = getElement(site.nodes, home.id)!.children.find((id) => isElement(site.nodes[id]))!
    expect(pageOfNode(site.nodes, hero)).toBe(home.id)
    const header = getElement(site.nodes, site.rootId)!.children.find((id) => isElement(site.nodes[id]))!
    expect(pageOfNode(site.nodes, header)).toBeNull()
  })

  it('makes clean unique addresses', () => {
    expect(uniquePath('About Us!', [])).toBe('/about-us')
    expect(uniquePath('/shop/new', ['/shop/new'])).toBe('/shop/new-2')
    expect(uniquePath('/', ['/'])).toBe('/page')
  })
})
