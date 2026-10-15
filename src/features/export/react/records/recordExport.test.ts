import { describe, expect, it } from 'vitest'
import { addSource } from '@/features/editor/model/data'
import { DATA_PRESETS } from '@/features/editor/model/dataPresets'
import { autoWire } from '@/features/editor/model/dataRecords'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { isElement, type ElementNode, type PageDoc } from '@/features/editor/model/types'
import { buildReactProject } from '../buildReactProject'

const DETAIL = '<section class="detail" data-fe-record="storeProducts" data-fe-row="ROW"><img src="x.jpg" alt=""><h2>Title</h2><p>Text</p><span>12</span><a href="/buy">Buy</a></section>'
const project = (row: string): { files: Record<string, string>; doc: PageDoc } => {
  const base = addSource(parseHtmlDocument(`<body><header>Shop</header>${DETAIL.replace('ROW', row)}<footer>Bye</footer></body>`), DATA_PRESETS[1]!.source).doc
  const box = Object.values(base.nodes).filter(isElement).find((node) => node.tag === 'section') as ElementNode
  const doc = { ...base, nodes: autoWire(base.nodes, box.id, base.data![0]!) }
  return { files: buildReactProject(doc), doc }
}
const record = (files: Record<string, string>) => Object.entries(files).find(([path]) => path.endsWith('Record.tsx'))?.[1] ?? ''

describe('record export', () => {
  it('writes a component with a typed hook and the fields as props', () => {
    const { files } = project('first')
    const code = record(files)
    expect(code).toContain("import { useStoreProductsRecord } from '../api/storeProducts'")
    expect(code).toContain("const query = useStoreProductsRecord('first')")
    expect(code).toContain('if (query.isPending)')
    expect(code).toContain('= query.data ?? ({} as Partial<StoreProduct>)')
    expect(code).toMatch(/<h2>\{title\}<\/h2>/)
    expect(code).toContain('src={image}')
    expect(code).not.toContain('data-fe-')
    expect(files['src/api/storeProducts.ts']).toContain('export function useStoreProductsRecord(')
    expect(Object.values(files).some((text) => text.includes('<StoreProductRecord />'))).toBe(true)
    expect(files['src/main.tsx']).toContain('QueryClientProvider')
  })

  it('takes the row number or the page address', () => {
    expect(record(project('3').files)).toContain('useStoreProductsRecord(3)')
    expect(record(project('?slug').files)).toContain('useStoreProductsRecord({ param: "slug" })')
  })
})
