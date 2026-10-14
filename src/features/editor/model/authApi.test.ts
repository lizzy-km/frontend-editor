import { describe, expect, it } from 'vitest'
import { DEFAULT_ENDPOINTS, endpointsOf } from './authApi'

describe('sign-in API', () => {
  it('uses the usual paths until one is changed', () => {
    expect(endpointsOf({})).toEqual(DEFAULT_ENDPOINTS)
    const changed = endpointsOf({ authApi: { login: '/api/sessions', register: '  ' } })
    expect(changed.login).toBe('/api/sessions')
    expect(changed.register).toBe('/auth/register')
  })
})
