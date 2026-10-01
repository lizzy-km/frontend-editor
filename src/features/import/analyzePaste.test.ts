import { describe, expect, it } from 'vitest'
import { analyzePaste } from './analyzePaste'

describe('analyzePaste', () => {
  it('stays quiet for an empty box', () => {
    expect(analyzePaste({ html: '  ' })).toEqual({ ok: false, found: [] })
  })

  it('explains when the text is not code', () => {
    const result = analyzePaste({ html: 'Here is a website for your bakery!' })
    expect(result.ok).toBe(false)
    expect(result.problem).toMatch(/doesn't look like web page code/)
  })

  it('summarizes an AI reply with Tailwind and a script', () => {
    const reply = [
      'Sure! Here you go:',
      '```html',
      '<!doctype html><html><head><script src="https://cdn.tailwindcss.com"></script></head>',
      '<body><h1 class="text-4xl">Hi</h1><p>There</p><script>console.log(1)</script></body></html>',
      '```',
    ].join('\n')
    const result = analyzePaste({ html: reply })
    expect(result.ok).toBe(true)
    expect(result.found).toEqual(['2 elements', 'Tailwind', '1 script'])
  })
})
