import { describe, expect, it } from 'vitest'
import { VISITOR, type Viewer } from './conditions'
import { guardPage } from './pageGuard'
import { addAuthPages } from './authPages'
import { addPage, updatePage } from './pageOps'
import { listPages } from './pages'
import { parseHtmlDocument } from './parse/parseDocument'
import { patchNode } from './tree/treeOps'
import type { ElementNode } from './types'

const MEMBER: Viewer = { signedIn: true, roles: ['member'], flags: [] }
const site = (withLogin: boolean) => {
  let doc = parseHtmlDocument('<body><header>Shop</header><h1>Hi</h1></body>')
  const account = addPage(doc, { title: 'Account', path: '/account', from: 'blank' })
  doc = updatePage(account.doc, account.pageId, { private: true })
  const admin = addPage(doc, { title: 'Admin', path: '/admin', from: 'blank' })
  doc = { ...admin.doc, nodes: patchNode<ElementNode>(admin.doc.nodes, admin.pageId, (node) => ({ ...node, attrs: { ...node.attrs, 'data-fe-roles': 'admin' } })) }
  if (withLogin) doc = addAuthPages(doc)
  const id = (path: string) => listPages(doc).find((page) => page.path === path)!.id
  return { doc, id }
}

describe('page guard (Preview, public view, downloads)', () => {
  it('sends a signed-out visitor from a signed-in page to the log in page', () => {
    const { doc, id } = site(true)
    expect(guardPage(doc, id('/account'), VISITOR)).toEqual({ pageId: id('/login') })
    expect(guardPage(doc, id('/admin'), VISITOR)).toEqual({ pageId: id('/login') })
    expect(guardPage(doc, id('/'), VISITOR)).toEqual({ pageId: id('/') })
  })

  it('shows a notice when the site has no log in page', () => {
    const { doc, id } = site(false)
    expect(guardPage(doc, id('/account'), VISITOR)).toEqual({ pageId: null, notice: 'login' })
  })

  it('lets people in who may, and tells others there is no access', () => {
    const { doc, id } = site(true)
    expect(guardPage(doc, id('/account'), MEMBER)).toEqual({ pageId: id('/account') })
    expect(guardPage(doc, id('/admin'), MEMBER)).toEqual({ pageId: null, notice: 'no-access' })
    expect(guardPage(doc, id('/admin'), { ...MEMBER, roles: ['admin'] })).toEqual({ pageId: id('/admin') })
  })

  it('sends signed-in people away from the log in page', () => {
    const { doc, id } = site(true)
    expect(guardPage(doc, id('/login'), MEMBER)).toEqual({ pageId: id('/') })
  })
})
