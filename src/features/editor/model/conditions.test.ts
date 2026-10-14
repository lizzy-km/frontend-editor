import { describe, expect, it } from 'vitest'
import { conditionAttrs, conditionOf, describeCondition, hiddenFor, visibleTo, VISITOR, type Viewer } from './conditions'
import { parseHtmlDocument } from './parse/parseDocument'
import type { ElementNode } from './types'

const el = (attrs: Record<string, string>): ElementNode => ({ id: 'x', kind: 'element', tag: 'div', parentId: null, attrs, styles: {}, children: [] })
const member: Viewer = { signedIn: true, roles: ['member'], flags: [] }
const admin: Viewer = { signedIn: true, roles: ['admin'], flags: ['beta'] }

describe('who can see this', () => {
  it('reads conditions, including old "signed-in only" pages', () => {
    expect(conditionOf(el({}))).toEqual({ audience: 'everyone', roles: [], flags: [] })
    expect(conditionOf(el({ 'data-fe-private': '' })).audience).toBe('signed-in')
    expect(conditionOf(el({ 'data-fe-roles': 'admin, editor' }))).toEqual({ audience: 'signed-in', roles: ['admin', 'editor'], flags: [] })
    expect(conditionOf(el({ 'data-fe-show': 'signed-out', 'data-fe-flags': 'beta' }))).toEqual({ audience: 'signed-out', roles: [], flags: ['beta'] })
  })

  it('decides for each viewer', () => {
    const adminsWithBeta = conditionOf(el({ 'data-fe-roles': 'admin', 'data-fe-flags': 'beta' }))
    expect(visibleTo(adminsWithBeta, admin)).toBe(true)
    expect(visibleTo(adminsWithBeta, member)).toBe(false)
    expect(visibleTo(adminsWithBeta, VISITOR)).toBe(false)
    const signedOut = conditionOf(el({ 'data-fe-show': 'signed-out' }))
    expect(visibleTo(signedOut, VISITOR)).toBe(true)
    expect(visibleTo(signedOut, member)).toBe(false)
  })

  it('writes attributes back (roles imply signed in) and describes them', () => {
    expect(conditionAttrs({ audience: 'signed-in', roles: ['admin'], flags: [] })).toMatchObject({ 'data-fe-show': '', 'data-fe-roles': 'admin' })
    expect(conditionAttrs({ audience: 'everyone', roles: [], flags: [] })).toMatchObject({ 'data-fe-show': '', 'data-fe-roles': '', 'data-fe-flags': '' })
    expect(describeCondition({ audience: 'signed-in', roles: ['admin'], flags: ['beta'] })).toBe('admin only · beta')
  })

  it('lists what a viewer cannot see', () => {
    const doc = parseHtmlDocument('<body><a data-fe-show="signed-out">Log in</a><a data-fe-show="signed-in">Account</a><div data-fe-roles="admin">Admin</div></body>')
    const tags = (ids: string[]) => ids.map((id) => (doc.nodes[id] as ElementNode).attrs)
    expect(tags(hiddenFor(doc.nodes, VISITOR))).toHaveLength(2)
    expect(tags(hiddenFor(doc.nodes, member)).map((attrs) => Object.keys(attrs)[0])).toEqual(['data-fe-show', 'data-fe-roles'])
  })
})
