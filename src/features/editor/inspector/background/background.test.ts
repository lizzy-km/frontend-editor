import { describe, expect, it } from 'vitest'
import { backgroundCss, parseBackground } from './backgroundLayers'
import { gradientCss, parseGradient, splitTopLevel } from './gradient'

describe('gradients', () => {
  it('splits on top-level commas only', () => {
    expect(splitTopLevel('red, rgb(1, 2, 3) 50%, blue')).toEqual(['red', 'rgb(1, 2, 3) 50%', 'blue'])
  })

  it('reads straight gradients in every spelling the browser uses', () => {
    expect(parseGradient('linear-gradient(to right, red, blue)')).toMatchObject({ kind: 'linear', angle: 90, stops: [{ color: 'red', at: 0 }, { color: 'blue', at: 100 }] })
    expect(parseGradient('linear-gradient(0.25turn, rgb(255, 0, 0) 10%, rgba(0, 0, 255, 0.5) 90%)')).toMatchObject({
      angle: 90, stops: [{ color: 'rgb(255, 0, 0)', at: 10 }, { color: 'rgba(0, 0, 255, 0.5)', at: 90 }],
    })
    expect(parseGradient('linear-gradient(red, white, blue)')!.stops.map((stop) => stop.at)).toEqual([0, 50, 100])
    expect(parseGradient('linear-gradient(to bottom left, red, blue)')!.angle).toBe(225)
  })

  it('reads round and sweep gradients', () => {
    expect(parseGradient('radial-gradient(circle at left top, red, blue)')).toMatchObject({ kind: 'radial', shape: 'circle', center: '0% 0%' })
    expect(parseGradient('radial-gradient(red, blue)')).toMatchObject({ kind: 'radial', shape: 'ellipse', center: '50% 50%' })
    expect(parseGradient('conic-gradient(from 45deg at 30% 70%, red, blue)')).toMatchObject({ kind: 'conic', angle: 45, center: '30% 70%' })
  })

  it("refuses what it can't edit exactly", () => {
    expect(parseGradient('linear-gradient(red 20px, blue 80px)')).toBeNull()
    expect(parseGradient('radial-gradient(closest-side, red, blue)')).toBeNull()
    expect(parseGradient('linear-gradient(red, 30%, blue)')).toBeNull()
    expect(parseGradient('repeating-linear-gradient(red, blue 10%)')).toBeNull()
  })

  it('writes what it reads', () => {
    const css = 'radial-gradient(circle at 50% 50%, rgb(255, 0, 0) 0%, blue 100%)'
    expect(gradientCss(parseGradient(css)!)).toBe(css)
    expect(gradientCss(parseGradient('linear-gradient(to right, red, blue)')!)).toBe('linear-gradient(90deg, red 0%, blue 100%)')
  })
})

describe('background layers', () => {
  it('reads a gradient over a photo', () => {
    const layers = parseBackground('linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://x.com/a b.jpg")')
    expect(layers.gradient?.stops).toHaveLength(2)
    expect(layers.picture).toBe('https://x.com/a b.jpg')
    expect(layers.custom).toBe(false)
  })

  it('marks what the panel cannot edit as custom', () => {
    expect(parseBackground('url(a.jpg), url(b.jpg)').custom).toBe(true)
    expect(parseBackground('linear-gradient(red 2px, blue 9px)').custom).toBe(true)
    expect(parseBackground('none')).toEqual({ gradient: null, picture: null, custom: false })
  })

  it('writes the gradient on top of the picture, and "none" when empty', () => {
    const gradient = parseGradient('linear-gradient(red, blue)')
    expect(backgroundCss({ gradient, picture: 'a.jpg' })).toBe('linear-gradient(180deg, red 0%, blue 100%), url("a.jpg")')
    expect(backgroundCss({ gradient: null, picture: 'say "hi".jpg' })).toBe('url("say %22hi%22.jpg")')
    expect(backgroundCss({ gradient: null, picture: null })).toBe('none')
  })
})
