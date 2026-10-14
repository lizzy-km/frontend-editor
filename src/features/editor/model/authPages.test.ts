import { describe, expect, it } from 'vitest'
import { addAuthPages, missingAuthPages } from './authPages'
import { listPages } from './pages'
import { addPage } from './pageOps'
import { parseHtmlDocument } from './parse/parseDocument'

const start = () => parseHtmlDocument('<body><header>Shop</header><h1>Hi</h1></body>')

describe('sign-in pages', () => {
  it('adds all five as pages, the first three for signed-out visitors only', () => {
    const doc = addAuthPages(start())
    const pages = listPages(doc)
    expect(pages.filter((page) => page.path !== '/').map((page) => page.path)).toEqual(['/login', '/register', '/forgot-password', '/reset-password', '/confirm-email'])
    expect(Object.fromEntries(pages.map((page) => [page.path, page.access.audience]))).toMatchObject({
      '/login': 'signed-out', '/register': 'signed-out', '/forgot-password': 'signed-out', '/reset-password': 'everyone', '/confirm-email': 'everyone',
    })
    expect(missingAuthPages(doc)).toHaveLength(0)
  })

  it('only adds what is missing and keeps an existing /login', () => {
    const own = addPage(start(), { title: 'My login', path: '/login', from: 'blank' }).doc
    const doc = addAuthPages(own)
    expect(listPages(doc).filter((page) => page.path === '/login')).toHaveLength(1)
    expect(listPages(doc).find((page) => page.path === '/login')!.title).toBe('My login')
    expect(listPages(addAuthPages(doc))).toHaveLength(listPages(doc).length)
  })
})
