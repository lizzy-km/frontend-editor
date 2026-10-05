import { describe, expect, it } from 'vitest'
import { alphaOf, withAlpha } from './color'

describe('color alpha', () => {
  it('reads how solid a color is', () => {
    expect(alphaOf('rgba(0, 0, 0, 0.4)')).toBe(0.4)
    expect(alphaOf('rgb(0 0 0 / 50%)')).toBe(0.5)
    expect(alphaOf('rgb(10, 20, 30)')).toBe(1)
    expect(alphaOf('#ff000080')).toBe(0.5)
    expect(alphaOf('#fff')).toBe(1)
    expect(alphaOf('transparent')).toBe(0)
  })

  it('sets how solid a color is', () => {
    expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
    expect(withAlpha('rgba(0, 128, 255, 0.2)', 1)).toBe('#0080ff')
  })
})
