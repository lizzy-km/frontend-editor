import { describe, expect, it } from 'vitest'
import { addSource } from '@/features/editor/model/data'
import { listBoxHtml } from '@/features/editor/model/dataLists'
import { DATA_PRESETS } from '@/features/editor/model/dataPresets'
import { detailPageHtml, detailPath, detailTitle } from '@/features/editor/model/detailPage'
import { addPage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { isElement, type PageDoc } from '@/features/editor/model/types'
import { siteToSplitFiles } from '../siteFiles'
import { buildSiteProject } from './buildSiteProject'

/** A shop: the home page lists products (cards link to /store-product/:id), the detail page shows one. */
function shop(): PageDoc {
  const source = DATA_PRESETS[1]!.source
  const withData = addSource(parseHtmlDocument('<body><header><a href="/">Shop</a> <a href="/store-product/2">Featured</a></header></body>'), source).doc
  const detail = addPage(withData, { title: detailTitle({ ...source, id: 'x' }), path: detailPath({ ...source, id: 'x' }), from: 'code', code: detailPageHtml({ ...source, id: 'x' }) })
  // The home page: a list whose cards have a link bound to the detail page.
  const withList = addPage(detail.doc, { title: 'Catalog', path: '/catalog', from: 'code', code: listBoxHtml({ ...source, id: 'x' }).replace('</article>', '<a href="/x" data-fe-bind-href="/store-product/:id">Open</a></article>') })
  return withList.doc
}

describe('dynamic routes', () => {
  it('names the detail page like /store-product/:id', () => {
    const source = { ...DATA_PRESETS[1]!.source, id: 'x' }
    expect(detailPath(source)).toBe('/store-product/:id')
    expect(detailTitle(source)).toBe('Store product details')
  })

  it('React Router keeps :id and the record reads the router param', () => {
    const files = buildSiteProject(shop(), { router: 'react-router' })
    expect(files['src/router.tsx']).toContain("path: '/store-product/:id'")
    const record = Object.entries(files).find(([path]) => path.endsWith('Record.tsx'))![1]
    expect(record).toContain("import { useParams } from 'react-router'")
    expect(record).toContain('const params = useParams()')
    expect(record).toContain('useStoreProductsRecord({ param: "id", value: params["id"] })')
    expect(files['src/api/storeProducts.ts']).toContain('which.value ?? new URLSearchParams')
    // a link to /store-product/2 stays a router link; card links are templates over the row's id
    expect(Object.values(files).some((text) => text.includes('<Link to="/store-product/2">'))).toBe(true)
    expect(Object.values(files).some((text) => text.includes('href={`/store-product/${encodeURIComponent(String(id))}`}'))).toBe(true)
  })

  it('TanStack writes $id and gives typed links their params', () => {
    const files = buildSiteProject(shop(), { router: 'tanstack' })
    expect(files['src/router.tsx']).toContain("path: '/store-product/$id'")
    const record = Object.entries(files).find(([path]) => path.endsWith('Record.tsx'))![1]
    expect(record).toContain("import { useParams } from '@tanstack/react-router'")
    expect(record).toContain('useParams({ strict: false })')
    expect(Object.values(files).some((text) => text.includes('<Link to="/store-product/$id" params={{"id":"2"}}>Featured</Link>'))).toBe(true)
  })

  it('downloads: a file per pattern, links with the value in the address, card links filled in', () => {
    const files = siteToSplitFiles(shop())
    expect(Object.keys(files)).toContain('store-product-_id.html')
    const home = Object.entries(files).find(([name]) => name === 'index.html')![1]
    expect(home).toContain('href="store-product-_id.html?id=2"')
    const catalog = files['catalog.html']!
    expect(catalog).toContain('href="store-product-_id.html?id=1"')
    expect(catalog).toContain('href="store-product-_id.html?id=6"'.replace('6', String(DATA_PRESETS[1]!.source.rows.length)))
    expect(files['script.js']).toContain('URLSearchParams') // the shared script picks the record from ?id=
    expect(Object.entries(files).filter(([, text]) => /\shref="[^"]*:id/.test(text)).map(([name, text]) => `${name}: ${text.match(/\shref="[^"]*:id[^"]*"/)![0]}`)).toEqual([]) // no link keeps its :id
  })

  it('the detail page is a record box wired to the address', () => {
    const doc = shop()
    const box = Object.values(doc.nodes).filter(isElement).find((node) => node.attrs['data-fe-record'])!
    expect(box.attrs['data-fe-row']).toBe('?id')
  })
})
