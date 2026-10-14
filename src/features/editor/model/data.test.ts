import { describe, expect, it } from 'vitest'
import { addField, addRow, addSource, changeField, codeName, removeField, rowTypeName, setCell, updateSource } from './data'
import { DATA_PRESETS } from './dataPresets'
import { createEmptyDoc } from './parse/parseDocument'

const products = DATA_PRESETS[0]!.source

describe('data sources', () => {
  it('makes code-safe names and row type names', () => {
    expect(codeName('Blog posts')).toBe('blogPosts')
    expect(codeName('2024 sales')).toBe('items')
    expect(rowTypeName('products')).toBe('Product')
    expect(rowTypeName('stories')).toBe('Story')
    expect(rowTypeName('team')).toBe('TeamItem')
  })

  it('adds sources with unique names and renames them safely', () => {
    const first = addSource(createEmptyDoc(), products)
    const id = first.id
    let { doc } = addSource(first.doc, products)
    expect(doc.data!.map((source) => source.name)).toEqual(['products', 'products2'])
    doc = updateSource(doc, id, { name: 'Shop items!' })
    expect(doc.data![0]!.name).toBe('shopItems')
    doc = updateSource(doc, id, { api: { url: 'https://api.example.com/products', listPath: 'data.items' } })
    expect(doc.data![0]!.api?.listPath).toBe('data.items')
  })

  it('keeps rows in step with fields', () => {
    const added = addSource(createEmptyDoc(), products)
    const id = added.id
    let doc = addField(added.doc, id, { name: 'Sale price', type: 'number' })
    expect(doc.data![0]!.rows[0]!.salePrice).toBe(0)
    doc = changeField(doc, id, 1, { name: 'cost', type: 'text' }) // price -> cost (text)
    expect(doc.data![0]!.rows[0]).toMatchObject({ cost: '59' })
    expect(doc.data![0]!.rows[0]).not.toHaveProperty('price')
    doc = removeField(doc, id, 1)
    expect(doc.data![0]!.fields.map((f) => f.name)).not.toContain('cost')
    doc = addRow(doc, id)
    expect(doc.data![0]!.rows).toHaveLength(7)
    doc = setCell(doc, id, 6, { name: 'inStock', type: 'boolean' }, 'yes')
    expect(doc.data![0]!.rows[6]!.inStock).toBe(true)
  })
})
