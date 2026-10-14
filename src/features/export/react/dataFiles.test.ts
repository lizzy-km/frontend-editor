import { describe, expect, it } from 'vitest'
import { DATA_PRESETS } from '@/features/editor/model/dataPresets'
import type { DataSource } from '@/features/editor/model/types'
import { dataFiles } from './dataTemplates'

const products: DataSource = { id: 'p', ...DATA_PRESETS[0]!.source }

describe('React data files', () => {
  it('writes nothing without data sources', () => {
    expect(dataFiles([])).toEqual({})
  })

  it('types every row, with an id for React keys', () => {
    const files = dataFiles([products])
    expect(files['src/data/types.ts']).toContain('export type Product = {\n  id: string\n  name: string\n  price: number')
    expect(files['src/data/mockData.ts']).toContain('"id": "1"')
    expect(files['src/data/mockData.ts']).toContain('products: Product[]')
  })

  it('makes typed fetch and React Query hooks, sample data until VITE_USE_MOCK=false', () => {
    const paged = dataFiles([{ ...products, api: { url: 'https://x.dev/p', listPath: 'data.items', pageParam: 'page', pageSizeParam: 'limit' } }])['src/api/products.ts']!
    expect(paged).toContain('export async function fetchProducts(page = 1, pageSize = 12): Promise<ProductPage>')
    expect(paged).toContain('if (USE_MOCK || !ADDRESS) return slice(mockData.products, page, pageSize)')
    expect(paged).toContain('params: { "page": page, "limit": pageSize }')
    expect(paged).toContain('export const useProductsInfinite')
    const all = dataFiles([{ ...products, api: { url: '/products' } }])['src/api/products.ts']!
    expect(all).toContain('The API returns everything at once')
  })
})
