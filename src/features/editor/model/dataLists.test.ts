import { describe, expect, it } from 'vitest'
import { addSource } from './data'
import { DATA_PRESETS } from './dataPresets'
import { listAround, listBoxHtml, listInfo } from './dataLists'
import { parseHtmlDocument } from './parse/parseDocument'
import { buildPageParts } from './serialize/buildPage'
import { expandDataLists } from './serialize/expandLists'
import { getElement } from './tree/queries'
import { isElement } from './types'

function page() {
  const empty = parseHtmlDocument('<body></body>')
  const { doc } = addSource(empty, DATA_PRESETS[0]!.source)
  const source = doc.data![0]!
  const withList = parseHtmlDocument(`<body>${listBoxHtml(source)}</body>`)
  return { ...withList, data: doc.data }
}

describe('List from data', () => {
  it('reads the box settings and its card design', () => {
    const doc = page()
    const box = getElement(doc.nodes, doc.rootId)!.children.find((id) => isElement(doc.nodes[id]))!
    const info = listInfo(doc.nodes, box)!
    expect(info).toMatchObject({ source: 'products', pageSize: 6, load: 'scroll' })
    const card = getElement(doc.nodes, info.templateId)!
    const heading = Object.values(doc.nodes).find((node) => isElement(node) && node.tag === 'h3')!
    expect(listAround(doc.nodes, heading.id)?.id).toBe(box)
    expect(card.tag).toBe('article')
  })

  it('fills one card per row for Preview and downloads', () => {
    const html = buildPageParts(expandDataLists(page())).bodyHtml
    expect(html.match(/<article/g)).toHaveLength(6)
    expect(html).toContain('>Linen shirt<')
    expect(html).toContain('>Desk lamp<')
    expect(html).toContain('>59<')
    expect(html).toContain('photo-1602810318383')
  })

  it('keeps the design when the data has no rows', () => {
    const doc = page()
    const html = buildPageParts(expandDataLists({ ...doc, data: [{ ...doc.data![0]!, rows: [] }] })).bodyHtml
    expect(html.match(/<article/g)).toHaveLength(1)
    expect(html).toContain('>name<')
  })
})
