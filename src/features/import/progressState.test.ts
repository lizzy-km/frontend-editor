import { describe, expect, it } from 'vitest'
import { advance, startProgress, stepsFor, stepState } from './progressState'

describe('the import progress', () => {
  it('moves through the steps as the import reports them, and shows the signed-in step only when it is needed', () => {
    let state = startProgress(1000)
    expect(stepsFor(state).map((step) => step.id)).toEqual(['read', 'start', 'visit', 'build'])
    expect(stepState(state, 'read')).toBe('active')
    state = advance(state, { kind: 'start', signedIn: false })
    expect([stepState(state, 'read'), stepState(state, 'start'), stepState(state, 'visit')]).toEqual(['done', 'active', 'waiting'])
    state = advance(state, { kind: 'visit', path: '/shop', visits: 2, found: 1 })
    expect(state).toMatchObject({ stage: 'visit', path: '/shop', visits: 2 })
    state = advance(state, { kind: 'start', signedIn: true })
    expect(stepsFor(state).map((step) => step.id)).toEqual(['read', 'start', 'visit', 'member', 'build'])
    expect([stepState(state, 'visit'), stepState(state, 'member'), stepState(state, 'build')]).toEqual(['done', 'active', 'waiting'])
    state = advance(state, { kind: 'visit', path: '/account', visits: 9, found: 6 })
    expect(state.stage).toBe('member')
    state = advance(state, { kind: 'build' })
    expect(stepState(state, 'member')).toBe('done')
    expect(stepState(state, 'build')).toBe('active')
  })

  it('collects the pages found, once each, with their names and the lock for members-only ones', () => {
    let state = startProgress()
    state = advance(state, { kind: 'page', path: '/', title: 'Home', private: false })
    state = advance(state, { kind: 'page', path: '/account', title: 'My orders', private: true })
    state = advance(state, { kind: 'page', path: '/', title: 'Home again', private: false })
    expect(state.pages).toEqual([{ path: '/', title: 'Home', private: false }, { path: '/account', title: 'My orders', private: true }])
  })
})
