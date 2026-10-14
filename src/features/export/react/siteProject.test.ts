import { describe, expect, it } from 'vitest'
import { addPage, updatePage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildSiteProject } from './buildSiteProject'

function site() {
  const start = parseHtmlDocument('<body><header class="top"><a href="/">Home</a> <a href="/about">About</a></header><section class="hero"><h1>Hi</h1></section><footer>Bye</footer></body>')
  const about = addPage(start, { title: 'About', path: '/about', from: 'blank' })
  const team = addPage(about.doc, { title: 'Team', path: '/team', from: 'blank' })
  return updatePage(team.doc, team.pageId, { private: true })
}

describe('React site project', () => {
  for (const router of ['react-router', 'tanstack'] as const) {
    it(`builds a routed app with ${router}`, () => {
      const files = buildSiteProject(site(), { router })
      for (const path of ['src/router.tsx', 'src/main.tsx', 'src/layout/Layout.tsx', 'src/pages/HomePage.tsx', 'src/pages/AboutPage.tsx', 'src/pages/TeamPage.tsx', 'src/pages/NotFoundPage.tsx']) {
        expect(files[path], path).toBeTruthy()
      }
      expect(JSON.parse(files['package.json']!).dependencies).toHaveProperty(router === 'tanstack' ? '@tanstack/react-router' : 'react-router')
      expect(files['src/layout/Layout.tsx']).toContain('<Outlet />')
      expect(files['src/router.tsx']).toContain("'/about'")
    })
  }

  it('turns links to pages into router links', () => {
    const files = buildSiteProject(site(), { router: 'react-router' })
    const header = files['src/components/layout/Top.tsx']!
    expect(header).toContain("import { Link } from 'react-router'")
    expect(header).toContain('<Link to="/about">About</Link>')
  })

  it('guards signed-in only pages and adds a login page', () => {
    const rr = buildSiteProject(site(), { router: 'react-router' })
    expect(rr['src/router.tsx']).toContain('<RequireAuth><TeamPage /></RequireAuth>')
    expect(rr['src/main.tsx']).toContain('<AuthProvider>')
    expect(rr['src/pages/LoginPage.tsx']).toContain('signIn')
    const ts = buildSiteProject(site(), { router: 'tanstack' })
    expect(ts['src/router.tsx']).toContain('beforeLoad: requireSignIn')
    expect(ts['src/auth/RequireAuth.tsx']).toContain('throw redirect')
  })

  it('has no auth files when every page is public', () => {
    const open = buildSiteProject(addPage(parseHtmlDocument('<p>x</p>'), { title: 'B', path: '/b', from: 'blank' }).doc, { router: 'react-router' })
    expect(Object.keys(open).some((path) => path.startsWith('src/auth/'))).toBe(false)
  })
})
