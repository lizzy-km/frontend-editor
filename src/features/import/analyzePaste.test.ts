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

describe('files that were not pasted', () => {
  it('lists local scripts and stylesheets, not full addresses', () => {
    const result = analyzePaste({ html: '<html><head><link rel="stylesheet" href="css/site.css"><script type="module" src="/src/main.tsx"></script><script src="https://cdn.example.com/lib.js"></script></head><body><h1>Hi</h1></body></html>' })
    expect(result.missing).toEqual(['/src/main.tsx', 'css/site.css'])
  })

  it('says nothing when everything is in the code', () => {
    expect(analyzePaste({ html: '<h1>Hi</h1>' }).missing).toBeUndefined()
  })
})
