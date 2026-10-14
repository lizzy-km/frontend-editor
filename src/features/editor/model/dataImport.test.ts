import { describe, expect, it } from 'vitest'
import { addSource } from './data'
import { findList, importData, parseJsonData } from './dataImport'
import { parseHtmlDocument } from './parse/parseDocument'

const STORE = [
  { id: 1, title: 'Backpack', price: 109.95, description: 'Your perfect pack for everyday use and walks in the forest.', category: "men's clothing", image: 'https://fakestoreapi.com/img/81fPKd.jpg', rating: { rate: 3.9, count: 120 } },
  { id: 2, title: 'T-Shirt', price: 22.3, description: 'Slim-fitting style', category: "men's clothing", image: 'https://fakestoreapi.com/img/71-3Hj.jpg', rating: { rate: 4.1, count: 259 }, tags: ['new', 'sale'] },
]

describe('JSON import', () => {
  it('finds fields, kinds and rows in a plain array (Fake Store API shape)', () => {
    const result = parseJsonData(JSON.stringify(STORE))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(Object.fromEntries(result.fields.map((field) => [field.name, field.type]))).toEqual({
      id: 'number', title: 'text', price: 'number', description: 'text', category: 'text', image: 'image', ratingRate: 'number', ratingCount: 'number', tags: 'text',
    })
    expect(result.rows[1]).toMatchObject({ title: 'T-Shirt', price: 22.3, ratingRate: 4.1, tags: 'new, sale' })
    expect(result.rows[0]!.tags).toBe('') // missing in the first item
  })

  it('finds the list inside an answer, and accepts one object', () => {
    expect(findList({ status: 'ok', data: { items: STORE, meta: [{ a: 1 }] } })).toHaveLength(2)
    const one = parseJsonData('{ "name": "Ana", "active": true, "born": "1990-05-02", "bio": "x" }')
    expect(one.ok && one.rows).toHaveLength(1)
    expect(one.ok && Object.fromEntries(one.fields.map((field) => [field.name, field.type]))).toEqual({ name: 'text', active: 'boolean', born: 'date', bio: 'text' })
  })

  it('makes safe names and reports what it left out', () => {
    const result = parseJsonData('[{ "First name": "A", "first-name": "B", "items": [{ "x": 1 }] }]')
    expect(result.ok && result.fields.map((field) => field.name)).toEqual(['firstName', 'firstName2'])
    expect(result.ok && result.notes[0]).toContain('“items”')
  })

  it('explains bad input', () => {
    expect(parseJsonData('[{ oops')).toMatchObject({ ok: false })
    expect(parseJsonData('[1, 2, 3]')).toMatchObject({ ok: false })
    expect(parseJsonData('{}')).toMatchObject({ ok: false })
  })

  it('replaces a source or adds to it', () => {
    const parsed = parseJsonData(JSON.stringify(STORE))
    if (!parsed.ok) throw new Error('parse')
    const start = addSource(parseHtmlDocument('<body></body>'), { name: 'products', fields: [{ name: 'title', type: 'text' }, { name: 'stock', type: 'number' }], rows: [{ title: 'Old', stock: 3 }] })
    const replaced = importData(start.doc, start.id, parsed, 'replace').data![0]!
    expect(replaced.fields.map((field) => field.name)).not.toContain('stock')
    expect(replaced.rows).toHaveLength(2)
    const added = importData(start.doc, start.id, parsed, 'add').data![0]!
    expect(added.rows).toHaveLength(3)
    expect(added.rows[0]).toMatchObject({ title: 'Old', stock: 3, price: 0 })
    expect(added.fields.map((field) => field.name)).toEqual(expect.arrayContaining(['stock', 'price', 'image']))
    expect(added.rows[2]).toMatchObject({ title: 'T-Shirt', stock: 0 })
  })
})
