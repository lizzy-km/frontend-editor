import { afterEach, describe, expect, it, vi } from 'vitest'
import { screenPath } from './autoTrack'
import { analyticsAllowed, saveOptOut } from './consent'

type Match = { route: { path?: string } }
const state = (pathname: string, ...paths: (string | undefined)[]) => ({
  location: { pathname } as Location,
  matches: paths.map((path) => ({ route: { path } }) as Match),
}) as unknown as Parameters<typeof screenPath>[0]

describe('screenPath', () => {
  it('counts screens, not page ids', () => {
    expect(screenPath(state('/edit/abc123', undefined, '/edit/:projectId'))).toBe('/edit/:projectId')
    expect(screenPath(state('/p/xyz', undefined, '/p/:projectId'))).toBe('/p/:projectId')
  })

  it('falls back to the address when no route matched', () => {
    expect(screenPath(state('/nowhere'))).toBe('/nowhere')
  })
})

describe('usage stats consent', () => {
  afterEach(() => {
    saveOptOut(false)
    vi.unstubAllGlobals()
  })

  it('is on by default and can be switched off and back on', () => {
    expect(analyticsAllowed()).toBe(true)
    saveOptOut(true)
    expect(analyticsAllowed()).toBe(false)
    saveOptOut(false)
    expect(analyticsAllowed()).toBe(true)
  })

  it('respects Do Not Track and Global Privacy Control', () => {
    vi.stubGlobal('navigator', { ...navigator, doNotTrack: '1' })
    expect(analyticsAllowed()).toBe(false)
    vi.stubGlobal('navigator', { ...navigator, doNotTrack: null, globalPrivacyControl: true })
    expect(analyticsAllowed()).toBe(false)
  })
})
