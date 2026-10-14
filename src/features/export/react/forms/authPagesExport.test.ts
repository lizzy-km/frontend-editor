import { describe, expect, it } from 'vitest'
import { addAuthPages } from '@/features/editor/model/authPages'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildSiteProject } from '../buildSiteProject'

const files = (router: 'react-router' | 'tanstack') =>
  buildSiteProject(addAuthPages(parseHtmlDocument('<body><header><a href="/login">Log in</a></header><h1>Hi</h1></body>')), { router })
const code = (all: Record<string, string>, text: string) => Object.entries(all).find(([path, body]) => path.includes('components') && body.includes(text))?.[1] ?? ''

describe('sign-in pages export', () => {
  for (const router of ['react-router', 'tanstack'] as const) {
    it(`wires each form to useAuth (${router}) and keeps the site's own /login`, () => {
      const all = files(router)
      expect(Object.keys(all).filter((path) => path.startsWith('src/pages/')).sort()).toEqual(expect.arrayContaining([
        'src/pages/ConfirmEmailPage.tsx', 'src/pages/CreateAccountPage.tsx', 'src/pages/ForgotPasswordPage.tsx', 'src/pages/LogInPage.tsx', 'src/pages/SetANewPasswordPage.tsx',
      ]))
      expect(all['src/pages/LoginPage.tsx']).toBeUndefined() // the site's own /login replaces the standard one
      expect(code(all, 'await signIn(')).toContain("sessionStorage.getItem('auth:redirect')")
      expect(code(all, 'createAccount')).toContain('needsConfirmation')
      expect(code(all, 'forgotPassword(')).not.toContain('api.post')
      expect(code(all, 'resetPassword(token')).toContain('URLSearchParams')
      expect(code(all, 'confirmEmail(token)')).toContain('useRef')
      expect(all['src/auth/AuthProvider.tsx']).toBeTruthy()
      expect(all['src/api/client.ts']).toBeTruthy()
      expect(JSON.parse(all['package.json']!).dependencies).toHaveProperty('axios')
    })
  }
})
