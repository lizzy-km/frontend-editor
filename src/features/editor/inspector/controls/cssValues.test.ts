import { describe, expect, it } from 'vitest'
import { isTransparent, splitUnit, toHexColor } from './cssValues'

describe('css value helpers', () => {
  it('splits numbers and units', () => {
    expect(splitUnit('16px')).toEqual({ number: 16, unit: 'px' })
    expect(splitUnit('1.5')).toEqual({ number: 1.5, unit: '' })
    expect(splitUnit('auto')).toEqual({ number: null, unit: 'auto' })
  })
  it('converts colors to hex', () => {
    expect(toHexColor('rgb(12, 34, 56)')).toBe('#0c2238')
    expect(toHexColor('#abc')).toBe('#aabbcc')
    expect(toHexColor('rgba(255, 0, 0, 0.5)')).toBe('#ff0000')
  })
  it('detects transparent colors', () => {
    expect(isTransparent('rgba(0, 0, 0, 0)')).toBe(true)
    expect(isTransparent('transparent')).toBe(true)
    expect(isTransparent('rgb(0, 0, 0)')).toBe(false)
  })
})
