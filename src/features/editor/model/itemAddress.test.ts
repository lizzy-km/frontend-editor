import { describe, expect, it } from 'vitest'
import { fillAddress, hasToken, itemPathOf, readPath } from './apiTest'
import { itemParts } from '@/features/export/react/itemAddress'

describe('addresses with :id', () => {
  it('finds a changing part, but not a port', () => {
    expect(hasToken('https://api.example.com/products/:id')).toBe(true)
    expect(hasToken('https://api.example.com/users/:userId/posts')).toBe(true)
    expect(hasToken('https://api.example.com/products')).toBe(false)
    expect(hasToken('http://localhost:3000/products')).toBe(false)
    expect(hasToken('https://api.example.com/v:2/x')).toBe(false)
  })

  it('fills the first changing part, safely', () => {
    expect(fillAddress('https://api.example.com/products/:id', 3)).toBe('https://api.example.com/products/3')
    expect(fillAddress('https://api.example.com/u/:id/posts', 'a b/c')).toBe('https://api.example.com/u/a%20b%2Fc/posts')
    expect(fillAddress('http://localhost:3000/items/:id', 7)).toBe('http://localhost:3000/items/7')
  })

  it('splits an address around its :id for the download', () => {
    expect(itemParts('https://api.example.com/products/:id')).toEqual({ before: 'https://api.example.com/products/', after: '' })
    expect(itemParts('https://api.example.com/users/:userId/posts?lang=en')).toEqual({ before: 'https://api.example.com/users/', after: '/posts?lang=en' })
    expect(itemParts('http://localhost:3000/items/:id')).toEqual({ before: 'http://localhost:3000/items/', after: '' })
    expect(itemParts('https://api.example.com/products')).toBeNull()
    expect(itemParts(undefined)).toBeNull()
  })

  it('finds where the item is inside a one-item answer', () => {
    expect(itemPathOf({ id: 3, title: 'x' })).toBe('')
    expect(itemPathOf({ data: { id: 3 } })).toBe('data')
    expect(itemPathOf({ status: 'ok', data: { id: 3 }, meta: {} })).toBe('data')
    expect(itemPathOf([1, 2])).toBe('')
    expect(readPath({ rating: { rate: 4 } }, 'rating.rate')).toBe(4)
    expect(readPath({ rating: {} }, 'rating.rate')).toBeUndefined()
  })
})
