import { describe, expect, it } from 'vitest'
import { parseColor, replaceColors, scanColors } from './colorTokens'

describe('color tokens', () => {
  it('reads hex, rgb(), hsl() and white/black', () => {
    const keys = (text: string) => scanColors(text).map((token) => token.key)
    expect(keys('color: #FFF; background: #1c1917; border: 1px solid rgb(255, 0, 0)')).toEqual(['#ffffff', '#1c1917', '#ff0000'])
    expect(keys('x: hsl(0 100% 50%) rgba(0,0,0,.5) #00ff0080 white')).toEqual(['#ff0000', '#000000', '#00ff00', '#ffffff'])
    expect(parseColor('rgb(10% 20% 30%)')).toMatchObject({ rgb: { r: 25.5, g: 51, b: 76.5 } })
  })

  it('ignores things that are not plain colors', () => {
    expect(scanColors('rgb(var(--x)) transparent rgba(0,0,0,0) .white url(#abc) #fade-in color-white')).toEqual([])
  })

  it('swaps a color everywhere in a value and keeps each one\'s transparency', () => {
    const text = 'box-shadow: 0 0 0 1px rgba(255, 0, 0, .4), 0 1px #f00; background: linear-gradient(#ff0000, #00f)'
    expect(replaceColors(text, '#ff0000', '#0a7d3b')).toBe('box-shadow: 0 0 0 1px rgba(10, 125, 59, 0.4), 0 1px #0a7d3b; background: linear-gradient(#0a7d3b, #00f)')
    expect(replaceColors('color: #ff000080', '#ff0000', '#112233')).toBe('color: #11223380')
    expect(replaceColors('color: #123', '#ff0000', '#000000')).toBe('color: #123')
  })
})
