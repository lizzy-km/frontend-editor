import { describe, expect, it } from 'vitest'
import { splitImports } from './cssImports'
import { wrapUserCss } from './styleSheets'

const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600&family=Inter:wght@400;700&display=swap');"

describe('splitImports', () => {
  it('keeps a Google Fonts import whole (it contains ";" inside the url)', () => {
    const { imports, rest } = splitImports(`${FONTS}\nbody { color: red }`)
    expect(imports).toEqual([FONTS])
    expect(rest.trim()).toBe('body { color: red }')
  })

  it('handles @charset, unquoted url() and multiple imports', () => {
    const { imports } = splitImports('@charset "utf-8";\n@import url(a.css);\n@import "b.css" screen;\np{}')
    expect(imports).toEqual(['@charset "utf-8";', '@import url(a.css);', '@import "b.css" screen;'])
  })

  it('leaves "@import" in comments, strings and nested blocks alone', () => {
    const css = '/* @import url(x.css); */ .a::before { content: "@import y;" } @media print { @import url(z.css); }'
    expect(splitImports(css)).toEqual({ imports: [], rest: css })
  })

  it('wrapUserCss hoists the import above the layer and keeps every rule', () => {
    const wrapped = wrapUserCss(`${FONTS}\n:root { --x: 1 }\nbody { margin: 0 }`)
    expect(wrapped.startsWith(FONTS)).toBe(true)
    expect(wrapped).toContain('@layer page {\n:root { --x: 1 }\nbody { margin: 0 }\n}')
  })
})
