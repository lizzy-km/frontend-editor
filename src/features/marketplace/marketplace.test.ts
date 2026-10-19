import { describe, expect, it } from 'vitest'
import { shown } from './browse'
import type { Listing } from './types'
import { listingProblem, payoutProblem } from './validate'

const item = (id: string, extra: Partial<Listing>): Listing => ({ id, ownerId: 'o', sellerName: 'Carol', projectId: 'p', title: id, description: '', priceUsd: 10, thumbnailUrl: null, status: 'active', salesCount: 0, createdAt: 1, updatedAt: 1, ...extra })

describe('browsing the marketplace', () => {
  const all = [item('Bakery', { priceUsd: 20, createdAt: 3, salesCount: 1, description: 'Warm bread' }), item('Portfolio', { priceUsd: 5, createdAt: 1, sellerName: 'Dan', salesCount: 9 }), item('Gym', { priceUsd: 50, createdAt: 2 })]

  it('sorts by newest, price and popularity', () => {
    expect(shown(all, '', 'new').map((one) => one.id)).toEqual(['Bakery', 'Gym', 'Portfolio'])
    expect(shown(all, '', 'cheap').map((one) => one.id)).toEqual(['Portfolio', 'Bakery', 'Gym'])
    expect(shown(all, '', 'dear').map((one) => one.id)).toEqual(['Gym', 'Bakery', 'Portfolio'])
    expect(shown(all, '', 'popular').map((one) => one.id)).toEqual(['Portfolio', 'Bakery', 'Gym'])
  })

  it('finds every word in the title, description or seller, ignoring case', () => {
    expect(shown(all, 'bread', 'new').map((one) => one.id)).toEqual(['Bakery'])
    expect(shown(all, 'dan port', 'new').map((one) => one.id)).toEqual(['Portfolio'])
    expect(shown(all, 'bakery carol', 'new').map((one) => one.id)).toEqual(['Bakery'])
    expect(shown(all, 'nothing like this', 'new')).toEqual([])
  })

  it('does not change the list it was given', () => {
    const copy = [...all]
    shown(all, '', 'cheap')
    expect(all).toEqual(copy)
  })
})

describe('what a seller types', () => {
  const ok = { title: 'Bakery', description: 'Warm', priceUsd: 12 }

  it('accepts a good listing and explains a bad one', () => {
    expect(listingProblem(ok)).toBeNull()
    expect(listingProblem({ ...ok, title: '  ' })).toContain('title')
    expect(listingProblem({ ...ok, title: 'x'.repeat(101) })).toContain('100')
    expect(listingProblem({ ...ok, description: 'x'.repeat(1001) })).toContain('1000')
    for (const priceUsd of [0, 0.5, 501, NaN]) expect(listingProblem({ ...ok, priceUsd })).toContain('between $1 and $500')
  })

  it('checks a payout request against the wallet, the minimum and the balance', () => {
    const wallet = 'TXyz1234567890abcdef'
    expect(payoutProblem(wallet, 30, 50)).toBeNull()
    expect(payoutProblem('short', 30, 50)).toContain('wallet')
    expect(payoutProblem('has spaces in the address', 30, 50)).toContain('wallet')
    expect(payoutProblem(wallet, 5, 50)).toContain('$20')
    expect(payoutProblem(wallet, 80, 50)).toContain('balance')
  })
})
