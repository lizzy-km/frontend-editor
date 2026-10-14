import { describe, expect, it } from 'vitest'
import { addPage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildReactProject } from '../buildReactProject'
import { buildSiteProject } from '../buildSiteProject'
import { authFiles, needsAuth } from './authFiles'

const NAV = '<nav><a href="/">Home</a> <a href="/login" data-fe-show="signed-out">Log in</a> <a href="/admin" data-fe-roles="admin" data-fe-flags="beta">Admin</a></nav>'
const withNav = () => parseHtmlDocument(`<body><header>${NAV}</header><h1>Hi</h1></body>`)

describe('auth export', () => {
  it('is only added when something is shown to some visitors', () => {
    const plain = parseHtmlDocument('<body><h1>Hi</h1></body>')
    expect(needsAuth(plain)).toBe(false)
    expect(authFiles(plain)).toEqual({})
    expect(needsAuth(withNav())).toBe(true)
  })

  it('writes the provider, session, API calls with the endpoints, mock and flags', () => {
    const doc = { ...withNav(), authApi: { login: '/api/sessions' } }
    const files = authFiles(doc)
    for (const path of ['src/auth/AuthProvider.tsx', 'src/auth/session.ts', 'src/auth/authMock.ts', 'src/auth/Show.tsx', 'src/api/client.ts']) {
      expect(files[path], path).toBeTruthy()
    }
    expect(files['src/auth/authApi.ts']).toContain('/api/sessions')
    expect(files['src/auth/authApi.ts']).toContain('/auth/register')
    expect(files['src/config/flags.ts']).toContain('"beta": false')
    expect(files['src/auth/RequireAuth.tsx']).toBeUndefined()
  })

  it('wraps conditional elements in <Show> (single page)', () => {
    const files = buildReactProject(withNav())
    const header = Object.entries(files).find(([path, text]) => path.includes('components') && text.includes('Log in'))![1]
    expect(header).toContain('<Show when={{ signedIn: false }}>')
    expect(header).toContain('roles: ["admin"]')
    expect(files['src/main.tsx']).toContain('<AuthProvider>')
    expect(JSON.parse(files['package.json']!).dependencies).toHaveProperty('axios')
  })

  it('keeps the site\'s own /login page instead of the standard one', () => {
    const own = addPage(withNav(), { title: 'Log in', path: '/login', from: 'blank' }).doc
    for (const router of ['react-router', 'tanstack'] as const) {
      expect(authFiles(own, router)['src/pages/LoginPage.tsx'], router).toBeUndefined()
      expect(authFiles(withNav(), router)['src/pages/LoginPage.tsx'], router).toContain('signIn')
      expect(buildSiteProject(own, { router })['src/auth/RequireAuth.tsx'], router).toBeTruthy()
    }
  })
})
