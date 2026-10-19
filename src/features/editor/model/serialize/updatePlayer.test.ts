import { afterEach, describe, expect, it, vi } from 'vitest'
import { addSource } from '../data'
import { DATA_PRESETS } from '../dataPresets'
import { parseHtmlDocument } from '../parse/parseDocument'
import { updateAttrValue, type UpdateClick } from '../updateClicks'
import { isElement, type ElementNode, type PageDoc } from '../types'
import { forVisitors } from './forVisitors'

const withApi = (click: UpdateClick): PageDoc => {
  const html = `<body><div data-fe-list="storeProducts" data-fe-load="all"><article class="card"><h3 data-fe-bind="title">T</h3><button data-fe-update='${updateAttrValue(click)}'>Buy</button></article></div></body>`
  const added = addSource(parseHtmlDocument(html), DATA_PRESETS[1]!.source)
  return { ...added.doc, data: added.doc.data!.map((source) => ({ ...source, api: { url: 'https://api.example.com/products' } })) }
}
const script = (doc: PageDoc) => forVisitors(doc).scripts.map((s) => s.code ?? '').find((code) => code.includes('PATCH')) ?? ''
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals() })

describe('update clicks for visitors', () => {
  const one: UpdateClick = { source: 'storeProducts', item: 'clicked', changes: [{ field: 'title', op: 'set', value: 'Sold out' }, { field: 'price', op: 'add', value: '5' }] }

  it('marks the cards so the click knows which item it is, and adds the player only for connected sources', () => {
    const out = forVisitors(withApi(one))
    const cards = Object.values(out.nodes).filter((n): n is ElementNode => isElement(n) && n.attrs.class === 'card')
    expect(cards.map((card) => card.attrs['data-fe-item'])).toEqual(['0', '1', '2', '3', '4'])
    expect(script(withApi(one))).toContain('/products')
    const added = addSource(parseHtmlDocument(`<body><div data-fe-list="storeProducts"><article><button data-fe-update='${updateAttrValue(one)}'>x</button></article></div></body>`), DATA_PRESETS[1]!.source)
    const unconnected = { ...added.doc, data: added.doc.data!.map((source) => ({ ...source, api: undefined })) }
    expect(forVisitors(unconnected).scripts.some((s) => (s.code ?? '').includes('PATCH'))).toBe(false)
  })

  it('sends the change for the clicked item to its address, then shows the new words', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const doc = withApi(one)
    const row = doc.data![0]!.rows[1]!
    document.body.innerHTML = '<article data-fe-item="1" data-fe-from="storeProducts"><h3 data-fe-bind="title">Old</h3><button data-fe-update=\'' + updateAttrValue(one) + '\'>Buy</button></article>'
    new Function(script(doc))()
    click(document.querySelector('button')!)
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [address, init] = fetchMock.mock.calls[0] as unknown as [string, { method: string; body: string }]
    expect(address).toBe(`https://api.example.com/products/${row.id}`)
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({ title: 'Sold out', price: Number(row.price) + 5 })
    expect(document.querySelector('h3')!.textContent).toBe('Sold out')
  })

  it('says so when the API refuses, and leaves the card as it was', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))
    const doc = withApi(one)
    document.body.innerHTML = '<article data-fe-item="0" data-fe-from="storeProducts"><h3 data-fe-bind="title">Old</h3><button data-fe-update=\'' + updateAttrValue(one) + '\'>Buy</button></article>'
    new Function(script(doc))()
    click(document.querySelector('button')!)
    await flush()
    expect(document.querySelector('[role=status]')?.textContent).toContain('could not be saved')
    expect(document.querySelector('h3')!.textContent).toBe('Old')
  })

  it('updates one chosen item by its id', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const fixed: UpdateClick = { source: 'storeProducts', item: { id: 'a b' }, changes: [{ field: 'title', op: 'set', value: 'X' }] }
    const doc = withApi(fixed)
    document.body.innerHTML = '<button data-fe-update=\'' + updateAttrValue(fixed) + '\'>Go</button>'
    new Function(script(doc))()
    click(document.querySelector('button')!)
    await flush()
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('https://api.example.com/products/a%20b')
  })
})
