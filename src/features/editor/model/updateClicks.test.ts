import { describe, expect, it } from 'vitest'
import { changedValue, itemAddress, requestBody, updateAttrValue, updateClickOf, updatableSources, usesUpdateClicks } from './updateClicks'
import { parseHtmlDocument } from './parse/parseDocument'

describe('update clicks', () => {
  const click = { source: 'products', item: 'clicked' as const, changes: [{ field: 'liked', op: 'toggle' as const, value: '' }] }

  it('round-trips through the attribute and ignores broken ones', () => {
    expect(updateClickOf({ 'data-fe-update': updateAttrValue(click) })).toEqual(click)
    expect(updateClickOf({ 'data-fe-update': '{"source":"a","item":{"id":"7"},"changes":[{"field":"x","op":"set","value":3}]}' })).toEqual({ source: 'a', item: { id: '7' }, changes: [{ field: 'x', op: 'set', value: '3' }] })
    for (const bad of ['', 'nope', '{"source":"a"}', '{"source":"a","item":"first","changes":[]}', '{"source":"a","item":"clicked","changes":[{"field":"x","op":"drop"}]}']) expect(updateClickOf({ 'data-fe-update': bad })).toBeNull()
    expect(updateAttrValue(null)).toBe('')
  })

  it('works out the new value of a field', () => {
    expect(changedValue({ field: 'n', op: 'add', value: '2' }, 'number', 3)).toBe(5)
    expect(changedValue({ field: 'n', op: 'add', value: '1' }, 'number', undefined)).toBe(1)
    expect(changedValue({ field: 'd', op: 'toggle', value: '' }, 'boolean', false)).toBe(true)
    expect(changedValue({ field: 'd', op: 'toggle', value: '' }, 'boolean', true)).toBe(false)
    expect(changedValue({ field: 'd', op: 'set', value: 'yes' }, 'boolean', undefined)).toBe(true)
    expect(changedValue({ field: 'p', op: 'set', value: '12' }, 'number', 1)).toBe(12)
    expect(changedValue({ field: 't', op: 'set', value: 'Hi' }, 'text', 'x')).toBe('Hi')
  })

  it('puts each value where the API keeps it', () => {
    expect(requestBody([{ name: 'rate', type: 'number', from: 'rating.rate' }, { name: 'done', type: 'boolean' }], { rate: 4, done: true })).toEqual({ rating: { rate: 4 }, done: true })
  })

  it('finds the item address and the sources a click can update', () => {
    expect(itemAddress({ url: 'https://x.com/products/' })).toBe('https://x.com/products/:id')
    expect(itemAddress({ url: 'https://x.com/list?limit=5' })).toBe('')
    expect(itemAddress({ url: 'https://x.com/p', itemUrl: 'https://x.com/p/:id' })).toBe('https://x.com/p/:id')
    expect(updatableSources({ data: [{ id: '1', name: 'a', fields: [], rows: [] }, { id: '2', name: 'b', fields: [], rows: [], api: { url: 'https://x.com/b' } }] }).map((source) => source.name)).toEqual(['b'])
  })

  it('knows when a page uses them', () => {
    const doc = parseHtmlDocument(`<body><button data-fe-update='${updateAttrValue(click)}'>Like</button></body>`)
    expect(usesUpdateClicks(doc.nodes)).toBe(true)
    expect(usesUpdateClicks(parseHtmlDocument('<body><button>Like</button></body>').nodes)).toBe(false)
  })
})
