import { describe, expect, it } from 'vitest'
import { listPages } from '@/features/editor/model/pages'
import { isElement } from '@/features/editor/model/types'
import { buildSite, widget } from './site'

describe('building an example site', () => {
  const doc = buildSite({
    title: 'Demo', css: ':root { --a: 1 }', home: '<section><h1>Hi</h1>' + widget('tabs') + '</section>', footer: '<footer>Bye</footer>',
    pages: [{ title: 'About', path: '/about', html: '<section><h1>About</h1></section>' }, { title: 'Hidden', path: '/hidden', html: '<section>x</section>', inMenu: false }],
    data: [{ name: 'things', fields: [{ name: 'name', type: 'text' }], rows: [{ name: 'a' }] }], access: { roles: ['member'], flags: ['beta'] },
  })

  it('makes a site with the pages in order, a shared menu, data, access and the look of the widgets used', () => {
    expect(listPages(doc).map((page) => [page.path, page.inMenu])).toEqual([['/', true], ['/about', true], ['/hidden', false]])
    expect(doc.title).toBe('Demo')
    expect(doc.data?.map((source) => source.name)).toEqual(['things'])
    expect(doc.access).toEqual({ roles: ['member'], flags: ['beta'] })
    expect(doc.css).toContain('tweak-ui tabs')
    const attrs = Object.values(doc.nodes).flatMap((node) => (isElement(node) ? [node.attrs] : []))
    expect(attrs.some((item) => 'data-fe-layout' in item)).toBe(true)
    expect(attrs.filter((item) => item['data-fe-nav'] !== undefined).map((item) => item.href)).toContain('/about')
    expect(attrs.some((item) => item['data-ui'] === 'tabs')).toBe(true)
  })

  it('refuses a widget that does not exist', () => {
    expect(() => widget('nope')).toThrow('no widget block')
  })
})
