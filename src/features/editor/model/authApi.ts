import type { PageDoc } from './types'

/** The sign-in API calls a React download makes (paths relative to VITE_API_URL). */
export type AuthEndpointKey = 'login' | 'register' | 'forgot' | 'reset' | 'confirm' | 'resend' | 'me' | 'refresh' | 'logout'
export type AuthEndpoints = Record<AuthEndpointKey, string>

/** Each call, in the order the Data tab lists them, with its plain-language label. */
export const AUTH_ENDPOINTS: { key: AuthEndpointKey; label: string; path: string }[] = [
  { key: 'login', label: 'Sign in', path: '/auth/login' },
  { key: 'register', label: 'Create account', path: '/auth/register' },
  { key: 'forgot', label: 'Forgot password', path: '/auth/forgot-password' },
  { key: 'reset', label: 'Set a new password', path: '/auth/reset-password' },
  { key: 'confirm', label: 'Confirm email', path: '/auth/confirm-email' },
  { key: 'resend', label: 'Send confirmation again', path: '/auth/resend-confirmation' },
  { key: 'me', label: 'Who is signed in', path: '/auth/me' },
  { key: 'refresh', label: 'Keep signed in (refresh)', path: '/auth/refresh' },
  { key: 'logout', label: 'Sign out', path: '/auth/logout' },
]

export const DEFAULT_ENDPOINTS = Object.fromEntries(AUTH_ENDPOINTS.map((item) => [item.key, item.path])) as AuthEndpoints

/** The site's sign-in API: the defaults with what was changed in the Data tab. */
export function endpointsOf(doc: Pick<PageDoc, 'authApi'>): AuthEndpoints {
  const changed = Object.entries(doc.authApi ?? {}).filter(([, path]) => path?.trim())
  return { ...DEFAULT_ENDPOINTS, ...Object.fromEntries(changed) }
}
