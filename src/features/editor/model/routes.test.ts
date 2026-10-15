import { describe, expect, it } from 'vitest'
import { uniquePath } from './pages'
import { fileSafePath, fillPath, isDynamicPath, matchPage, matchPath, routeParams, tanstackPath } from './routes'

describe('routes with changing parts', () => {
  it('knows patterns and their names', () => {
    expect(isDynamicPath('/products/:id')).toBe(true)
    expect(isDynamicPath('/products')).toBe(false)
    expect(isDynamicPath('/a:b')).toBe(false)
    expect(routeParams('/user/:id/posts/:postId')).toEqual(['id', 'postId'])
  })

  it('matches addresses (with the exact page winning)', () => {
    expect(matchPath('/user/:id', '/user/42')).toEqual({ id: '42' })
    expect(matchPath('/user/:id', '/user/42/posts')).toBeNull()
    expect(matchPath('/user/:id', '/team/42')).toBeNull()
    expect(matchPath('/user/:id', '/user/a%20b?x=1')).toEqual({ id: 'a b' })
    const pages = [{ path: '/' }, { path: '/user/:id' }, { path: '/user/new' }]
    expect(matchPage(pages, '/user/new')).toEqual({ page: pages[2], params: {} })
    expect(matchPage(pages, '/user/7')).toEqual({ page: pages[1], params: { id: '7' } })
    expect(matchPage(pages, '/nope')).toBeNull()
  })

  it('fills and converts patterns', () => {
    expect(fillPath('/products/:id', { id: 3 })).toBe('/products/3')
    expect(fillPath('/p/:name', { name: 'a b/c' })).toBe('/p/a%20b%2Fc')
    expect(fillPath('/p/:missing', {})).toBe('/p/')
    expect(tanstackPath('/user/:id/posts/:postId')).toBe('/user/$id/posts/$postId')
    expect(fileSafePath('/user/:id')).toBe('user-_id')
  })

  it('keeps :id when cleaning a page address', () => {
    expect(uniquePath('user/:id', [])).toBe('/user/:id')
    expect(uniquePath('Our Team/:memberId', [])).toBe('/our-team/:memberId')
    expect(uniquePath('/user/:id', ['/user/:id'])).toBe('/user-2/:id')
  })
})
