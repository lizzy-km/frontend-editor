import { describe, expect, it } from 'vitest'
import { downloadPeriod, nextReset, usedThisMonth } from './downloads'

describe('download counting', () => {
  it('names the month as a UTC number', () => {
    expect(downloadPeriod(new Date('2026-09-30T23:30:00Z'))).toBe(202609)
    expect(downloadPeriod(new Date('2026-12-01T00:00:00Z'))).toBe(202612)
  })
  it('counts from zero again in a new month', () => {
    const now = new Date('2026-10-02T10:00:00Z')
    expect(usedThisMonth(202609, 10, now)).toBe(0)
    expect(usedThisMonth(202610, 4, now)).toBe(4)
    expect(usedThisMonth(undefined, undefined, now)).toBe(0)
  })
  it('resets on the first day of next month (also across the year)', () => {
    expect(nextReset(new Date('2026-12-15T00:00:00Z')).toISOString()).toBe('2027-01-01T00:00:00.000Z')
  })
})
