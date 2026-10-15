import { describe, expect, it } from 'vitest'
import { addSource } from '../data'
import { DATA_PRESETS } from '../dataPresets'
import { rowChoiceAttr, rowChoiceOf } from '../dataRecords'
import { parseHtmlDocument } from '../parse/parseDocument'
import { isElement, type ElementNode, type PageDoc } from '../types'
import { forVisitors } from './forVisitors'

const html = `<body>
  <div data-fe-list="storeProducts" data-fe-load="all"><article class="card" data-fe-open="details"><h3 data-fe-bind="title">T</h3></article></div>
  <div data-fe-modal="details" data-fe-record="storeProducts" data-fe-row="clicked">
    <h2 id="pop" data-fe-bind="title">T</h2><a id="link" href="#" data-fe-bind-href="/product/:id">More</a><button id="go" data-fe-go="/product/:id">Go</button>
  </div></body>`
const doc = (): PageDoc => addSource(parseHtmlDocument(html), DATA_PRESETS[1]!.source).doc
const els = (d: PageDoc) => Object.values(d.nodes).filter((n): n is ElementNode => isElement(n))
const byId = (d: PageDoc, id: string) => els(d).find((n) => n.attrs.id === id)!

describe('a card opens a pop-up that shows its item', () => {
  it('the choice "clicked" is saved and read as that', () => {
    expect(rowChoiceOf('clicked')).toEqual({ kind: 'clicked' })
    expect(rowChoiceAttr({ kind: 'clicked' })).toBe('clicked')
  })

  it('every expanded card says which item it is', () => {
    const out = forVisitors(doc())
    const cards = els(out).filter((n) => n.attrs.class === 'card')
    expect(cards).toHaveLength(5)
    expect(cards.map((card) => card.attrs['data-fe-item'])).toEqual(['0', '1', '2', '3', '4'])
    expect(new Set(cards.map((card) => card.attrs['data-fe-from']))).toEqual(new Set(['storeProducts']))
  })

  it('the pop-up shows the first item until a card opens it, and keeps its address templates', () => {
    const out = forVisitors(doc())
    expect(out.nodes[byId(out, 'pop').children[0]!]).toMatchObject({ text: expect.stringContaining('Fjallraven') })
    expect(byId(out, 'link').attrs.href).toBe('/product/1')
    expect(byId(out, 'link').attrs['data-fe-bind-href']).toBe('/product/:id')
    expect(byId(out, 'go').attrs['data-fe-go']).toBe('/product/1')
    expect(byId(out, 'go').attrs['data-fe-bind-data-fe-go']).toBe('/product/:id')
  })

  it('the click player carries the rows, only when a pop-up needs them', () => {
    const out = forVisitors(doc())
    const script = out.scripts.map((s) => s.code ?? '').find((code) => code.includes('data-fe-item')) ?? ''
    expect(script).toContain('Fjallraven')
    expect(script).toContain('function fill')
    const plain = forVisitors(addSource(parseHtmlDocument('<body><div data-fe-list="storeProducts"><article><h3 data-fe-bind="title">T</h3></article></div></body>'), DATA_PRESETS[1]!.source).doc)
    expect(plain.scripts.some((s) => (s.code ?? '').includes('data-fe-item'))).toBe(false)
  })
})
