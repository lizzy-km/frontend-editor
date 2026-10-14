import { describe, expect, it } from 'vitest'
import { addAuthPages } from '@/features/editor/model/authPages'
import { applyLayout, type LayoutKind } from '@/features/editor/model/layouts'
import { addPage, updatePage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildSiteProject } from '../buildSiteProject'

const site = (kind: LayoutKind) => {
  let doc = parseHtmlDocument('<body><section>Hi</section></body>')
  const account = addPage(doc, { title: 'Account', path: '/account', from: 'blank' })
  doc = addAuthPages(updatePage(account.doc, account.pageId, { private: true }))
  return applyLayout(doc, kind, false)
}
const all = (files: Record<string, string>) => Object.entries(files).filter(([path]) => path.startsWith('src/components/')).map(([, code]) => code).join('\n')

describe('layout export', () => {
  it('React Router: NavLink menu, ☰ toggle, Log out and a Show around the signed-in link', () => {
    const files = buildSiteProject(site('both'), { router: 'react-router' })
    const code = all(files)
    expect(code).toContain("import { NavLink } from 'react-router'")
    expect(code).toContain('<NavLink to="/account"')
    expect(code).toMatch(/ end>Home<\/NavLink>/)
    expect(code).toContain("document.body.classList.toggle('menu-open')")
    expect(code).toContain("document.body.classList.remove('menu-open')")
    expect(code).toContain('void signOut()')
    expect(code).toContain("import { signOut } from '../../auth/signOut'")
    expect(code).toContain('<Show when={{ signedIn: true }}>')
    expect(files['src/auth/signOut.ts']).toContain('sessionEvents.onExpired()')
    expect(files['src/styles/page.css']).toContain('.lay-side')
  })

  it('TanStack: Link with activeProps', () => {
    const code = all(buildSiteProject(site('top'), { router: 'tanstack' }))
    expect(code).toContain("activeProps={{ className: 'active' }}")
    expect(code).toContain("activeOptions={{ exact: true }}")
    expect(code).not.toContain('NavLink')
  })
})
