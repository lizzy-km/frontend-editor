import { describe, expect, it } from 'vitest'
import { addSource } from './data'
import { DATA_PRESETS } from './dataPresets'
import { autoWire, bindableParts, dataAround, dataBoxOf, pickRow, rowChoiceAttr, rowChoiceOf, wiringAttrs } from './dataRecords'
import { parseHtmlDocument } from './parse/parseDocument'
import { forVisitors } from './serialize/forVisitors'
import { RECORD_ATTR, ROW_ATTR } from './dataRecords'
import { isElement, type ElementNode, type PageDoc } from './types'

const withData = (html: string): PageDoc => {
  const empty = parseHtmlDocument(`<body>${html}</body>`)
  return addSource(empty, { ...DATA_PRESETS[1]!.source }).doc // store products with id, title, price, description, category, image
}
const DETAIL = '<section data-fe-record="storeProducts" data-fe-row="first"><img src="x.jpg" alt=""><h2>Title</h2><p>Text <b>here</b></p><span>12</span><div><button>Buy</button></div></section>'
const find = (doc: PageDoc, test: (node: ElementNode) => boolean) => Object.values(doc.nodes).filter(isElement).find(test)!

describe('data records', () => {
  it('reads the row choice and picks rows', () => {
    expect(rowChoiceOf('first')).toEqual({ kind: 'first' })
    expect(rowChoiceOf('3')).toEqual({ kind: 'number', n: 3 })
    expect(rowChoiceOf('?id')).toEqual({ kind: 'param', name: 'id' })
    expect(rowChoiceAttr(rowChoiceOf('?slug'))).toBe('?slug')
    const rows = [{ id: 1, t: 'a' }, { id: 2, t: 'b' }, { id: 3, t: 'c' }]
    expect(pickRow(rows, { kind: 'number', n: 2 })).toMatchObject({ t: 'b' })
    expect(pickRow(rows, { kind: 'number', n: 9 })).toMatchObject({ t: 'a' })
    expect(pickRow(rows, { kind: 'param', name: 'id' }, '3')).toMatchObject({ t: 'c' })
    expect(pickRow(rows, { kind: 'param', name: 'id' }, 'nope')).toMatchObject({ t: 'a' })
    expect(pickRow(rows, { kind: 'param', name: 'id' }, null)).toMatchObject({ t: 'a' })
  })

  it('knows a box\'s data, and what is inside one', () => {
    const doc = withData(DETAIL)
    const box = find(doc, (node) => node.tag === 'section')
    expect(dataBoxOf(doc.nodes, box.id)).toEqual({ id: box.id, mode: 'record', source: 'storeProducts' })
    expect(dataAround(doc.nodes, find(doc, (node) => node.tag === 'h2').id)?.id).toBe(box.id)
    expect(dataAround(doc.nodes, box.id)).toBeNull()
    expect(bindableParts(doc.nodes, box.id).map((part) => part.tag)).toEqual(['img', 'h2', 'p', 'span', 'button'])
  })

  it('connects fields for the person', () => {
    const doc = withData(DETAIL)
    const box = find(doc, (node) => node.tag === 'section')
    const source = doc.data![0]!
    const wired = autoWire(doc.nodes, box.id, source)
    const bound = (tag: string) => (wired[find({ ...doc, nodes: wired }, (node) => node.tag === tag).id] as ElementNode).attrs
    expect(bound('img')['data-fe-bind-src']).toBe('image')
    expect(bound('h2')['data-fe-bind']).toBe('title')
    expect(bound('p')['data-fe-bind']).toBe('description')
    expect(bound('span')['data-fe-bind']).toBe('id') // first unused number field
  })

  it('sets and clears the wiring in one go', () => {
    const doc = withData('<div style="x"><h1>Hi</h1></div>')
    const box = find(doc, (node) => node.tag === 'div')
    expect(wiringAttrs('record', 'storeProducts', { kind: 'param', name: 'id' }, box)).toMatchObject({ [RECORD_ATTR]: 'storeProducts', [ROW_ATTR]: '?id', 'data-fe-list': '' })
    expect(wiringAttrs('list', 'storeProducts', undefined, box)).toMatchObject({ 'data-fe-list': 'storeProducts', 'data-fe-page-size': '6', [RECORD_ATTR]: '' })
    expect(wiringAttrs(null, '', undefined, box)).toMatchObject({ [RECORD_ATTR]: '', 'data-fe-list': '' })
  })

  it('shows the record\'s values in Preview and downloads (first row, or the numbered row)', () => {
    const doc = withData(DETAIL)
    const box = find(doc, (node) => node.tag === 'section')
    const source = doc.data![0]!
    const wired = { ...doc, nodes: autoWire(doc.nodes, box.id, source) }
    const first = forVisitors(wired)
    const text = (d: PageDoc, tag: string) => (d.nodes[find(d, (node) => node.tag === tag).children[0]!] as { text: string }).text
    expect(text(first, 'h2')).toBe(String(source.rows[0]!.title))
    expect(find(first, (node) => node.tag === 'img').attrs.src).toBe(String(source.rows[0]!.image))
    const second = forVisitors({ ...wired, nodes: { ...wired.nodes, [box.id]: { ...(wired.nodes[box.id] as ElementNode), attrs: { ...(wired.nodes[box.id] as ElementNode).attrs, [ROW_ATTR]: '2' } } } })
    expect(text(second, 'h2')).toBe(String(source.rows[1]!.title))
    expect(first.scripts.some((script) => script.code?.includes('URLSearchParams'))).toBe(false)
  })

  it('picks the record from the page address with a small player', () => {
    const doc = withData(DETAIL)
    const box = find(doc, (node) => node.tag === 'section')
    const source = doc.data![0]!
    const wired = { ...doc, nodes: { ...autoWire(doc.nodes, box.id, source), [box.id]: { ...box, attrs: { ...box.attrs, [ROW_ATTR]: '?id' } } } }
    const out = forVisitors(wired)
    const script = out.scripts.find((item) => item.code?.includes('URLSearchParams'))!
    expect(script.code).toContain(String(source.rows[3]!.title))
    document.body.innerHTML = '<section data-fe-record="storeProducts" data-fe-row="?id"><h2 data-fe-bind="title">x</h2><img data-fe-bind-src="image" src="a"></section>'
    window.history.pushState({}, '', '/?id=4')
    new Function(script.code!)()
    expect(document.querySelector('h2')!.textContent).toBe(String(source.rows[3]!.title))
    window.history.pushState({}, '', '/')
    document.querySelector('h2')!.textContent = 'kept'
    new Function(script.code!)()
    expect(document.querySelector('h2')!.textContent).toBe('kept')
  })
})
