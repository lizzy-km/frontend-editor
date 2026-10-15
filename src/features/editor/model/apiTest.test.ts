import { describe, expect, it, vi } from 'vitest'
import { authHeaders, checkAddress, explainStatus, testApi } from './apiTest'
import { findListAt, importData, parseJsonValue } from './dataImport'
import { addSource } from './data'
import { parseHtmlDocument } from './parse/parseDocument'

const answer = (body: unknown, status = 200) => vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }) as unknown as typeof fetch
const AUTH = { header: 'Authorization', prefix: 'Bearer ', envVar: 'VITE_API_KEY' }

describe('testing an API', () => {
  it('checks the address first', () => {
    expect(checkAddress('https://api.example.com/items')).toBeNull()
    expect(checkAddress('api.example.com')).toContain('https://')
    expect(checkAddress('ftp://x.com/y')).toContain('https://')
  })

  it('sends the key as a header, only when there is one', async () => {
    expect(authHeaders(AUTH, ' abc ')).toEqual({ Authorization: 'Bearer abc' })
    expect(authHeaders(AUTH, '')).toEqual({})
    expect(authHeaders(undefined, 'abc')).toEqual({})
    const request = answer([{ a: 1 }])
    const result = await testApi('https://api.example.com/items', AUTH, 'abc', request)
    expect(result).toMatchObject({ ok: true, status: 200, json: [{ a: 1 }] })
    expect((request as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![1].headers).toMatchObject({ Authorization: 'Bearer abc', Accept: 'application/json' })
  })

  it('explains what went wrong in plain words', async () => {
    expect(explainStatus(401)).toContain('not allowed')
    expect(explainStatus(404)).toContain('typos')
    expect(await testApi('https://x.test', undefined, '', answer({}, 403))).toMatchObject({ ok: false, message: expect.stringContaining('key') })
    expect(await testApi('nope', undefined, '', answer({}))).toMatchObject({ ok: false })
    const down = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch
    expect(await testApi('https://x.test', undefined, '', down)).toMatchObject({ ok: false, message: expect.stringContaining('CORS') })
    const html = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('x') } }) as unknown as typeof fetch
    expect(await testApi('https://x.test', undefined, '', html)).toMatchObject({ ok: false, message: expect.stringContaining('JSON') })
  })
})

describe('what an API answer becomes', () => {
  const body = { status: 'ok', data: { items: [{ id: 1, title: 'A', rating: { rate: 4.5, count: 3 }, tags: ['x', 'y'] }, { id: 2, title: 'B', rating: { rate: 3, count: 9 }, tags: [] }] } }

  it('finds where the list is and where each field sits', () => {
    expect(findListAt(body)?.path).toBe('data.items')
    const parsed = parseJsonValue(body)
    expect(parsed.ok && parsed.listPath).toBe('data.items')
    expect(parsed.ok && parsed.fields).toEqual([
      { name: 'id', type: 'number' }, { name: 'title', type: 'text' },
      { name: 'ratingRate', type: 'number', from: 'rating.rate' }, { name: 'ratingCount', type: 'number', from: 'rating.count' }, { name: 'tags', type: 'text' },
    ])
    expect(parseJsonValue([{ a: 1 }])).toMatchObject({ ok: true, listPath: '' })
  })

  it('connects a source: API settings and sample items together', () => {
    const parsed = parseJsonValue(body)
    if (!parsed.ok) throw new Error('parse')
    const start = addSource(parseHtmlDocument('<body></body>'), { name: 'items', fields: [], rows: [] })
    const doc = importData(start.doc, start.id, parsed, 'replace')
    expect(doc.data![0]!.rows).toHaveLength(2)
    expect(doc.data![0]!.fields.find((field) => field.name === 'ratingRate')!.from).toBe('rating.rate')
  })
})
