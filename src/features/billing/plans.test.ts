import { describe, expect, it } from 'vitest'
import { effectivePlan, planEnd } from './plans'

const NOW = Date.parse('2026-10-20T10:00:00Z')
const DAY = 24 * 3600 * 1000

describe('the plan someone has right now', () => {
  it('is Pro until the end date, then Free', () => {
    expect(effectivePlan({ plan: 'pro', planUntil: new Date(NOW + DAY) }, NOW)).toBe('pro')
    expect(effectivePlan({ plan: 'pro', planUntil: new Date(NOW - DAY) }, NOW)).toBe('free')
    expect(effectivePlan({ plan: 'pro', planUntil: { toMillis: () => NOW - 1 } }, NOW)).toBe('free')
  })

  it('keeps a plan with no end date, and falls back to Free for nothing or something unknown', () => {
    expect(effectivePlan({ plan: 'pro' }, NOW)).toBe('pro')
    expect(effectivePlan({}, NOW)).toBe('free')
    expect(effectivePlan(undefined, NOW)).toBe('free')
    expect(effectivePlan({ plan: 'gold' }, NOW)).toBe('free')
  })

  it('reads the end date from a date or a Firestore timestamp', () => {
    expect(planEnd({ planUntil: new Date(5) })).toBe(5)
    expect(planEnd({ planUntil: { toMillis: () => 7 } })).toBe(7)
    expect(planEnd({})).toBeNull()
  })
})
