import { describe, expect, it } from 'vitest'
import { addSource } from '@/features/editor/model/data'
import { DATA_PRESETS } from '@/features/editor/model/dataPresets'
import { listBoxHtml } from '@/features/editor/model/dataLists'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildReactProject } from './buildReactProject'

function project(load: 'scroll' | 'all') {
  const sources = addSource(parseHtmlDocument('<body></body>'), DATA_PRESETS[0]!.source).doc.data!
  const box = listBoxHtml(sources[0]!).replace('data-fe-load="scroll"', `data-fe-load="${load}"`)
  return buildReactProject({ ...parseHtmlDocument(`<body>${box}</body>`), data: sources })
}

describe('React "List from data"', () => {
  it('writes a typed card that takes one row', () => {
    const card = project('scroll')['src/components/ProductCard.tsx']!
    expect(card).toContain("import type { Product } from '../data/types'")
    expect(card).toMatch(/export default function ProductCard\(\{ [a-z, ]+ \}: Product\)/)
    expect(card).toContain('src={image}')
    expect(card).toContain('>{name}</h3>')
    expect(card).not.toContain('data-fe-')
  })

  it('loads page by page with the ready-made InfiniteScroll', () => {
    const files = project('scroll')
    expect(files['src/components/ProductsList.tsx']).toContain('const query = useProductsInfinite(6)')
    expect(files['src/components/ProductsList.tsx']).toContain('<InfiniteScroll query={query} render={(item) => <ProductCard key={item.id} {...item} />} />')
    expect(files['src/components/ui/InfiniteScroll.tsx']).toContain('IntersectionObserver')
  })

  it('shows everything at once when the box says "show all"', () => {
    const files = project('all')
    expect(files['src/components/ProductsList.tsx']).toContain('const query = useProducts()')
    expect(files['src/components/ui/InfiniteScroll.tsx']).toBeUndefined()
  })
})
