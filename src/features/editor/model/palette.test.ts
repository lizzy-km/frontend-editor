import { describe, expect, it } from 'vitest'
import { paletteOf, replaceColor, setThemeColor } from './palette'
import { parseHtmlDocument } from './parse/parseDocument'
import { isElement } from './types'

const doc = () => parseHtmlDocument(`<html><head><style>
/* old: #ff0000 */
:root { --primary: #c2410c; --shadow: 0 1px #c2410c; }
#fade { color: #333 }
.btn { background: var(--primary); color: #fff; border: 1px solid #C2410C }
.card { background: white; box-shadow: 0 2px rgba(0, 0, 0, .2) }
</style></head><body><h1 style="color: #c2410c">Hi</h1><svg><path fill="#c2410c"></path></svg><p style="color: #333">Hello</p></body></html>`)

describe('palette', () => {
  it('lists theme colors and literal colors by use', () => {
    const { theme, colors } = paletteOf(doc())
    expect(theme).toEqual([{ name: '--primary', key: '#c2410c', uses: 1 }])
    const uses = Object.fromEntries(colors.map((color) => [color.key, color.uses]))
    expect(uses['#c2410c']).toBeGreaterThanOrEqual(4) // shadow var, border, h1, svg path
    expect(uses['#ff0000']).toBeUndefined() // comment
    expect(uses['#333333']).toBe(2) // the #fade rule's color counts; its id selector does not
    expect(colors[0]!.uses).toBeGreaterThanOrEqual(colors.at(-1)!.uses)
  })

  it('changes a color everywhere (css, element styles, svg paint) except theme variables', () => {
    const start = doc()
    const next = replaceColor(start, '#c2410c', '#0a7d3b')
    expect(next.css).toContain('border: 1px solid #0a7d3b')
    expect(next.css).toContain('--shadow: 0 1px #0a7d3b')
    expect(next.css).toContain('--primary: #c2410c') // theme colors are changed on their own
    const nodes = Object.values(next.nodes).filter(isElement)
    expect(nodes.find((node) => node.tag === 'h1')!.styles.desktop!.color).toBe('#0a7d3b')
    expect(nodes.find((node) => node.tag === 'path')!.attrs.fill).toBe('#0a7d3b')
    expect(next.css).toContain('#fade { color: #333 }')
  })

  it('keeps untouched nodes the same objects, and returns the same doc when nothing changes', () => {
    const start = doc()
    const next = replaceColor(start, '#c2410c', '#0a7d3b')
    const p = Object.values(start.nodes).find((node) => isElement(node) && node.tag === 'p')!
    expect(next.nodes[p.id]).toBe(p)
    expect(replaceColor(start, '#c2410c', '#C2410C')).toBe(start)
    expect(replaceColor(start, '#abcdef', '#000000').css).toBe(start.css)
  })

  it('changes a theme color on its own', () => {
    const next = setThemeColor(doc(), '--primary', '#c2410c', '#0a7d3b')
    expect(next.css).toContain('--primary: #0a7d3b')
    expect(next.css).toContain('--shadow: 0 1px #c2410c')
    expect(next.css).toContain('background: var(--primary)')
    expect(paletteOf(next).theme[0]!.key).toBe('#0a7d3b')
  })
})
