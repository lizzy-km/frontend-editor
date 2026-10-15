import { describe, expect, it } from 'vitest'
import { embeddedPictures, replaceEmbedded, sizeReport, tooBigAdvice } from './embedded'
import { parseHtmlDocument } from './parse/parseDocument'
import { isElement } from './types'

const PNG = `data:image/png;base64,${'A'.repeat(400)}`
const JPG = `data:image/jpeg;base64,${'B'.repeat(300)}`
const page = () => parseHtmlDocument(`<html><head><style>.hero { background: url(${JPG}) }</style></head><body><img src="${PNG}" alt=""><img src="${PNG}" alt=""><div style="background-image: url('${JPG}')">x</div><p>Hi</p><img src="https://x.test/a.png"></body></html>`)

describe('pictures pasted inside the code', () => {
  it('finds each one once, in attributes, styles and the page CSS', () => {
    expect(embeddedPictures(page()).sort()).toEqual([JPG, PNG].sort())
    expect(embeddedPictures(parseHtmlDocument('<body><p>none</p><img src="https://x.test/a.png"></body>'))).toEqual([])
  })

  it('swaps them for links, keeping everything else the same objects', () => {
    const doc = page()
    const paragraph = Object.values(doc.nodes).find((node) => isElement(node) && node.tag === 'p')!
    const next = replaceEmbedded(doc, { [PNG]: 'https://cdn.test/a.png', [JPG]: 'https://cdn.test/b.jpg' })
    expect(embeddedPictures(next)).toEqual([])
    expect(next.css).toContain('https://cdn.test/b.jpg')
    const images = Object.values(next.nodes).filter(isElement).filter((node) => node.tag === 'img').map((node) => node.attrs.src)
    expect(images).toEqual(['https://cdn.test/a.png', 'https://cdn.test/a.png', 'https://x.test/a.png'])
    expect(next.nodes[paragraph.id]).toBe(paragraph)
    expect(JSON.stringify(next).length).toBeLessThan(JSON.stringify(doc).length)
  })

  it('says what is big, in plain words', () => {
    const report = sizeReport(page())
    expect(report.pictures).toBe(PNG.length + JPG.length)
    expect(tooBigAdvice(report)).toContain('Pictures pasted inside the code')
    expect(tooBigAdvice({ total: 5_000_000, pictures: 0, css: 4_000_000, scripts: 0, data: 10 })).toContain('styles take about 4.0 MB')
    expect(tooBigAdvice({ total: 5_000_000, pictures: 0, css: 0, scripts: 0, data: 4_500_000 })).toContain('Data tab')
    expect(tooBigAdvice({ total: 10, pictures: 0, css: 0, scripts: 0, data: 0 })).toContain('too much content')
  })
})
