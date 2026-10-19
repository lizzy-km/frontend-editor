import { describe, expect, it } from 'vitest'
import { addSource } from '@/features/editor/model/data'
import { listBoxHtml } from '@/features/editor/model/dataLists'
import { DATA_PRESETS } from '@/features/editor/model/dataPresets'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { updateAttrValue, type UpdateClick } from '@/features/editor/model/updateClicks'
import { buildReactProject } from './buildReactProject'

const source = { ...DATA_PRESETS[1]!.source, id: 'x' }
const click: UpdateClick = { source: 'storeProducts', item: 'clicked', changes: [{ field: 'title', op: 'set', value: 'Sold' }, { field: 'price', op: 'add', value: '2' }] }
const page = (attr: string) => {
  const list = listBoxHtml(source).replace('</article>', `<button ${attr}>Buy</button></article>`)
  const added = addSource(parseHtmlDocument(`<body><header>Shop</header>${list}<button data-fe-update='${updateAttrValue({ ...click, item: { id: '7' }, changes: [{ field: 'title', op: 'set', value: 'X' }, { field: 'price', op: 'add', value: '2' }] })}'>Fixed</button></body>`), DATA_PRESETS[1]!.source).doc
  return { ...added, data: added.data!.map((one) => ({ ...one, api: { url: 'https://api.example.com/products' } })) }
}
const files = () => buildReactProject(page(`data-fe-update='${updateAttrValue(click)}'`))
const code = (all: Record<string, string>) => Object.entries(all).filter(([path]) => path.startsWith('src/components/') && !path.includes('/ui/')).map(([, text]) => text).join('\n')

describe('updating API data on click in the React download', () => {
  it('writes an update function per source that patches the item (or the sample data) and refreshes the lists', () => {
    const all = files()
    const file = all['src/api/storeProducts.ts']!
    expect(file).toContain('export async function updateStoreProductsItem(id: string, changes: Record<string, string | number | boolean>)')
    expect(file).toContain('api.patch(UPDATE_BEFORE + encodeURIComponent(id) + UPDATE_AFTER')
    expect(file).toContain('const UPDATE_BEFORE = "https://api.example.com/products/"')
    expect(file).toContain("queryClient.invalidateQueries({ queryKey: ['storeProducts'] })")
    expect(file).toContain("import { queryClient } from './queryClient'")
    expect(all['src/api/queryClient.ts']).toContain('export const queryClient = new QueryClient')
    expect(all['src/main.tsx']).toContain("import { queryClient } from './api/queryClient'")
    expect(all['src/main.tsx']).not.toContain('new QueryClient')
  })

  it('a button in a data card updates that card\'s item; a button elsewhere updates the chosen item (set only)', () => {
    const text = code(files())
    expect(text).toContain('void updateStoreProductsItem(String(row.id), { "title": "Sold", "price": Number(row.price) + 2 })')
    expect(text).toContain("import { updateStoreProductsItem } from '../api/storeProducts'")
    expect(text).toContain('void updateStoreProductsItem("7", { "title": "X" })')
    expect(text).not.toContain('Number(row.price) + 2 })\'')
  })
})
