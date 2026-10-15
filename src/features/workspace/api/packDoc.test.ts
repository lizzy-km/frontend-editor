import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { packDoc, unpackDoc } from './packDoc'

const big = () => parseHtmlDocument(`<body>${Array.from({ length: 400 }, (_, i) => `<section class="s${i}"><h2>Heading number ${i}</h2><p>Some repeated paragraph text for section ${i}.</p></section>`).join('')}</body>`)

describe('saving a page as one text', () => {
  it('squeezes a big page and reads it back exactly', async () => {
    const doc = big()
    const packed = await packDoc(doc)
    expect(packed.startsWith('gz1:')).toBe(true)
    expect(packed.length).toBeLessThan(JSON.stringify(doc).length / 2)
    expect(await unpackDoc(packed)).toEqual(doc)
  })

  it('keeps small pages as plain JSON, and still reads old plain saves', async () => {
    const small = parseHtmlDocument('<body><h1>Hi</h1></body>')
    const packed = await packDoc(small)
    expect(packed.startsWith('{')).toBe(true)
    expect(await unpackDoc(packed)).toEqual(small)
    const old = big()
    expect(await unpackDoc(JSON.stringify(old))).toEqual(old)
  })
})
