import { describe, expect, it } from 'vitest'
import { SHOWCASES } from './catalog'

describe('the example catalog', () => {
  it('has at least four examples with different ids and titles, each building its own site', () => {
    expect(SHOWCASES.length).toBeGreaterThanOrEqual(4)
    expect(new Set(SHOWCASES.map((item) => item.id)).size).toBe(SHOWCASES.length)
    expect(new Set(SHOWCASES.map((item) => item.title)).size).toBe(SHOWCASES.length)
    expect(new Set(SHOWCASES.map((item) => item.build().title)).size).toBe(SHOWCASES.length)
  })

  it('builds a new document every time (opening one never changes another)', () => {
    const first = SHOWCASES[0]!.build()
    const second = SHOWCASES[0]!.build()
    expect(first).not.toBe(second)
    expect(Object.keys(first.nodes).length).toBeGreaterThan(50)
    expect(first.title).toBe(second.title)
  })
})
