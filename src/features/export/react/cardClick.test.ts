import { describe, expect, it } from 'vitest'
import { addSource } from '@/features/editor/model/data'
import { listBoxHtml } from '@/features/editor/model/dataLists'
import { DATA_PRESETS } from '@/features/editor/model/dataPresets'
import { detailPageHtml, detailPath, detailTitle } from '@/features/editor/model/detailPage'
import { addPage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { forVisitors } from '@/features/editor/model/serialize/forVisitors'
import { isElement, type PageDoc } from '@/features/editor/model/types'
import { siteToSplitFiles } from '../siteFiles'
import { buildReactProject } from './buildReactProject'
import { buildSiteProject } from './buildSiteProject'

const source = { ...DATA_PRESETS[1]!.source, id: 'x' }
const withClick = (attr: string) => listBoxHtml(source).replace('<article class="data-card"', `<article ${attr} class="data-card"`)
function shop(attr: string): PageDoc {
  const base = addSource(parseHtmlDocument('<body><header>Shop</header></body>'), DATA_PRESETS[1]!.source).doc
  const detail = addPage(base, { title: detailTitle(source), path: detailPath(source), from: 'code', code: detailPageHtml(source) }).doc
  return addPage(detail, { title: 'Catalog', path: '/catalog', from: 'code', code: withClick(attr) }).doc
}
const card = (files: Record<string, string>) => Object.entries(files).find(([path]) => path.endsWith('StoreProductCard.tsx'))?.[1] ?? ''

describe('clicking a data card', () => {
  it('opens a page with the row\'s values (React Router and TanStack)', () => {
    for (const router of ['react-router', 'tanstack'] as const) {
      const code = card(buildSiteProject(shop('data-fe-go="/store-product/:id"'), { router }))
      expect(code, router).toContain(`import { useNavigate } from '${router === 'react-router' ? 'react-router' : '@tanstack/react-router'}'`)
      expect(code).toContain('const navigate = useNavigate()')
      expect(code).toContain('/store-product/${encodeURIComponent(String(id))}')
      expect(code).toContain(router === 'react-router' ? 'navigate(`/store-product/' : 'navigate({ to: `/store-product/')
      expect(code).toContain('role="link"')
      expect(code).toMatch(/StoreProductCard\(\{ [^}]*\bid\b[^}]*\}: StoreProduct\)/) // the id is a prop now
    }
  })

  it('calls a function with the whole row and writes it in handlers.ts', () => {
    const files = buildReactProject(addSource(parseHtmlDocument('<body>' + withClick('data-fe-call="openProduct"') + '</body>'), DATA_PRESETS[1]!.source).doc)
    const code = card(files)
    expect(code).toContain("import { openProduct } from '../data/handlers'")
    expect(code).toContain('export default function StoreProductCard(row: StoreProduct) {')
    expect(code).toMatch(/const \{ [^}]* \} = row/)
    expect(code).toContain('onClick={() => openProduct(row)}')
    expect(files['src/data/handlers.ts']).toContain('export function openProduct(row: StoreProduct): void {')
    expect(files['src/data/handlers.ts']).toContain("import type { StoreProduct } from './types'")
  })

  it('has no handlers file and no hook when nothing is set', () => {
    const files = buildSiteProject(shop(''), { router: 'react-router' })
    expect(files['src/data/handlers.ts']).toBeUndefined()
    expect(card(files)).not.toContain('useNavigate')
  })

  it('Preview and downloads fill each card\'s address', () => {
    const doc = shop('data-fe-go="/store-product/:id"')
    const out = forVisitors(doc)
    const addresses = Object.values(out.nodes).filter(isElement).filter((node) => node.attrs['data-fe-go']).map((node) => node.attrs['data-fe-go'])
    expect(addresses).toEqual(DATA_PRESETS[1]!.source.rows.map((_, index) => `/store-product/${index + 1}`))
    const files = siteToSplitFiles(doc)
    expect(files['catalog.html']).toContain('data-fe-go="store-product-_id.html?id=1"')
    expect(files['catalog.html']).toContain('data-fe-go="store-product-_id.html?id=3"')
  })
})
