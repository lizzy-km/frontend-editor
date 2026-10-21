import { describe, expect, it } from 'vitest'
import { listPages } from '@/features/editor/model/pages'
import { isElement, type ElementNode } from '@/features/editor/model/types'
import { patternFor, seedsFor, type CrawledPage } from './crawl'
import { crawlToDoc } from './toDoc'

const HEADER = '<header><a href="/">Shop</a><nav><a href="/shop">Shop</a><a href="/about">About</a><a href="/account/orders">My orders</a></nav></header>'
const FOOTER = '<footer>© Shop</footer>'
const page = (path: string, title: string, body: string, extra: Partial<CrawledPage> = {}): CrawledPage => ({ path, pattern: path, title, html: `${HEADER}<main>${body}</main>${FOOTER}`, private: false, ...extra })

const RESULT = {
  pages: [
    page('/', 'Home — Shop', '<section><h1>Welcome</h1></section>'),
    page('/shop', 'Shop — Shop', '<section><h1>All products</h1><a href="/shop/1">Linen shirt</a></section>'),
    page('/shop/1', 'Linen shirt — Shop', '<section><h1>Linen shirt</h1></section>', { pattern: '/shop/:id' }),
    page('/about', 'About', '<section><h1>About us</h1></section>'),
    page('/account/orders', '', '<section><h1>My orders</h1></section>', { private: true }),
  ],
  styles: ['.box_x { color: red }', 'body { margin: 0 }'],
  warnings: [],
}
const HTML = { title: 'Alder & Co.', lang: 'en', links: ['https://fonts.googleapis.com/css2?family=Inter'] }

describe('crawl planning', () => {
  it('finds the route an address belongs to, and the first address to visit for each route', () => {
    const routes = ['/', '/shop', '/shop/:id', '/account/orders', '/files/:folder/:name', '*']
    expect(patternFor('/shop/12', routes)).toBe('/shop/:id')
    expect(patternFor('/files/a/b', routes)).toBe('/files/:folder/:name')
    expect(patternFor('/shop', routes)).toBe('/shop')
    expect(patternFor('/shop/12/extra', routes)).toBe('/shop/12/extra')
    expect(seedsFor(routes)).toEqual(['/', '/shop', '/shop/1', '/account/orders', '/files/1/1'])
  })
})

describe('turning the visited pages into a site', () => {
  const doc = crawlToDoc(RESULT, HTML)!

  it('makes one site with a page for every address, the first being home, and the app\'s header and footer shared', () => {
    expect(listPages(doc).map((one) => [one.path, one.title])).toEqual([['/', 'Home'], ['/shop', 'Shop'], ['/shop/:id', 'Linen shirt'], ['/about', 'About'], ['/account/orders', 'My orders']])
    const tags = Object.values(doc.nodes).filter((node): node is ElementNode => isElement(node)).map((node) => node.tag)
    expect(tags.filter((tag) => tag === 'header')).toHaveLength(1)
    expect(tags.filter((tag) => tag === 'footer')).toHaveLength(1)
    expect(doc.title).toBe('Alder & Co.')
  })

  it('lists in the menu the pages the header links to, and marks members-only pages', () => {
    const info = listPages(doc)
    expect(info.map((one) => [one.path, one.inMenu])).toEqual([['/', true], ['/shop', true], ['/shop/:id', false], ['/about', true], ['/account/orders', true]])
    expect(info.find((one) => one.path === '/account/orders')!.private).toBe(true)
    expect(info.filter((one) => one.private)).toHaveLength(1)
  })

  it('keeps the app\'s styles and its web fonts', () => {
    expect(doc.css).toContain('.box_x { color: red }')
    expect(doc.css).toContain('body { margin: 0 }')
    expect(doc.links).toContain('https://fonts.googleapis.com/css2?family=Inter')
  })

  it('has nothing to make from no pages', () => {
    expect(crawlToDoc({ pages: [], styles: [], warnings: [] }, HTML)).toBeNull()
  })
})
