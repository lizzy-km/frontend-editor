import { describe, expect, it } from 'vitest'
import { addSource } from '@/features/editor/model/data'
import { importData, parseJsonValue } from '@/features/editor/model/dataImport'
import { listBoxHtml } from '@/features/editor/model/dataLists'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import type { DataApi, PageDoc } from '@/features/editor/model/types'
import { buildReactProject } from './buildReactProject'

const ANSWER = { data: { items: [{ id: 1, title: 'A', rating: { rate: 4.5 }, tags: ['x', 'y'], born: '2020-01-02T10:00:00Z' }, { id: 2, title: 'B', rating: { rate: 3 }, tags: [], born: '2021-03-04' }] } }

function connected(api: DataApi): PageDoc {
  const parsed = parseJsonValue(ANSWER)
  if (!parsed.ok) throw new Error('parse')
  const start = addSource(parseHtmlDocument('<body></body>'), { name: 'items', fields: [], rows: [] })
  const doc = importData({ ...start.doc, data: [{ ...start.doc.data![0]!, api }] }, start.id, parsed, 'replace')
  return { ...doc, nodes: parseHtmlDocument(`<body>${listBoxHtml(doc.data![0]!)}</body>`).nodes, rootId: parseHtmlDocument('<body></body>').rootId, ...{ } } as PageDoc
}

describe('a connected API in the React download', () => {
  const doc = (() => {
    const base = connected({ url: 'https://api.example.com/shop', listPath: 'data.items', auth: { header: 'X-Api-Key', prefix: '', envVar: 'VITE_SHOP_KEY' } })
    return base
  })()

  it('maps the answer into typed items, reading nested fields', () => {
    const files = buildReactProject({ ...parseHtmlDocument(`<body>${listBoxHtml({ id: 'x', name: 'items', fields: [], rows: [] })}</body>`), data: doc.data })
    const code = files['src/api/items.ts']!
    expect(code).toContain('const ADDRESS = "https://api.example.com/shop"')
    expect(code).toContain('const LIST_PATH = "data.items"')
    expect(code).toContain('{"name":"ratingRate","from":"rating.rate","kind":"number"}')
    expect(code).toContain("pickList<unknown>(data, LIST_PATH).map(toRow)")
    expect(code).toContain('const toRow = (item: unknown): Item =>')
  })

  it('sends the key from .env as the chosen header, never writing the key itself', () => {
    const files = buildReactProject({ ...parseHtmlDocument(`<body>${listBoxHtml({ id: 'x', name: 'items', fields: [], rows: [] })}</body>`), data: doc.data })
    const code = files['src/api/items.ts']!
    expect(code).toContain('const KEY = import.meta.env.VITE_SHOP_KEY as string | undefined')
    expect(code).toContain('const HEADERS = KEY ? { "X-Api-Key": "" + KEY } : undefined')
    expect(code).toContain('api.get<unknown>(ADDRESS, { headers: HEADERS })')
    expect(files['.env.example']).toContain('VITE_SHOP_KEY=')
    expect(files['README.md']).toContain('never written into the code')
  })

  it('keeps a source without a key simple', () => {
    const plain = connected({ url: 'https://api.example.com/shop' })
    const files = buildReactProject({ ...parseHtmlDocument(`<body>${listBoxHtml({ id: 'x', name: 'items', fields: [], rows: [] })}</body>`), data: plain.data })
    expect(files['src/api/items.ts']).not.toContain('HEADERS')
    expect(files['.env.example']).not.toContain('Keys for the APIs')
  })

  it('asks for one item at a time when there is a one-item address', () => {
    const withItem = connected({ url: 'https://api.example.com/shop', listPath: 'data.items', itemUrl: 'https://api.example.com/shop/items/:id', itemPath: 'data' })
    const files = buildReactProject({ ...parseHtmlDocument(`<body>${listBoxHtml({ id: 'x', name: 'items', fields: [], rows: [] })}</body>`), data: withItem.data })
    const code = files['src/api/items.ts']!
    expect(code).toContain('const ITEM_BEFORE = "https://api.example.com/shop/items/"')
    expect(code).toContain('const ITEM_AFTER = ""')
    expect(code).toContain('const ITEM_PATH = "data"')
    expect(code).toContain('export async function fetchItemsItem(id: string): Promise<Item>')
    expect(code).toContain('ITEM_BEFORE + encodeURIComponent(id) + ITEM_AFTER')
    expect(code).toContain("const single = !USE_MOCK && Boolean(wanted)")
    expect(code).toContain('const query = useItems(!single)')
    expect(code).toContain('if (single) return { ...one }')
    // without it, the record hook only uses the list
    const plain = buildReactProject({ ...parseHtmlDocument(`<body>${listBoxHtml({ id: 'x', name: 'items', fields: [], rows: [] })}</body>`), data: connected({ url: 'https://api.example.com/shop' }).data })
    expect(plain['src/api/items.ts']).not.toContain('ITEM_BEFORE')
    expect(plain['src/api/items.ts']).toContain('const query = useItems()')
  })
})
