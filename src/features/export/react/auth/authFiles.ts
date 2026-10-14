import { endpointsOf } from '@/features/editor/model/authApi'
import { formSettings } from '@/features/editor/model/forms'
import { accessOf, conditionOf, hasCondition } from '@/features/editor/model/conditions'
import { listPages } from '@/features/editor/model/pages'
import { isElement, type PageDoc } from '@/features/editor/model/types'
import { clientFiles } from '../dataTemplates'
import type { RouterKind } from '../routerTemplates'
import { authApiSource, SESSION, TYPES } from './apiTemplates'
import { guardSource, noAccessSource } from './guardTemplates'
import { loginFallbackSource } from './loginTemplate'
import { MOCK } from './mockTemplate'
import { AUTH_PROVIDER, flagsSource, SHOW, USE_AUTH } from './providerTemplates'

export const AUTH_DEPS = { axios: '^1.12.0' }

/** Does the project need sign-in? (Something is shown only to some visitors, or a form logs people in, registers them…) */
export const needsAuth = (doc: PageDoc) =>
  Object.values(doc.nodes).some((node) => isElement(node) && (hasCondition(conditionOf(node)) || (node.tag === 'form' && formSettings(node).submit !== 'send')))

/** The site's flags plus any used on an element or page (so flags.ts lists every one). */
const flagsOf = (doc: PageDoc) => [...new Set([...accessOf(doc).flags,
  ...Object.values(doc.nodes).flatMap((node) => (isElement(node) ? conditionOf(node).flags : []))])]

/**
 * src/auth/* (types, session + tokens, API calls, mock, AuthProvider, useAuth,
 * Show), src/config/flags.ts and the API client; with a router also the route
 * guard, "No access" and a login page (unless the site has its own /login).
 */
export function authFiles(doc: PageDoc, router?: RouterKind): Record<string, string> {
  if (!needsAuth(doc)) return {}
  const files: Record<string, string> = {
    ...clientFiles(),
    'src/auth/types.ts': TYPES,
    'src/auth/session.ts': SESSION,
    'src/auth/authApi.ts': authApiSource(endpointsOf(doc)),
    'src/auth/authMock.ts': MOCK,
    'src/auth/AuthProvider.tsx': AUTH_PROVIDER,
    'src/auth/useAuth.ts': USE_AUTH,
    'src/auth/Show.tsx': SHOW,
    'src/config/flags.ts': flagsSource(flagsOf(doc)),
  }
  if (router) {
    files['src/auth/RequireAuth.tsx'] = guardSource(router)
    files['src/pages/NoAccessPage.tsx'] = noAccessSource(router)
    if (!listPages(doc).some((page) => page.path === '/login')) files['src/pages/LoginPage.tsx'] = loginFallbackSource(router)
  }
  return files
}
