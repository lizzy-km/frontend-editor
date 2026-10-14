/** The exported project's auth core: types, session (tokens), API calls and the mock backend. */

/** Paths of the auth API (relative to VITE_API_URL), set in the editor's Data tab. */
export type AuthEndpoints = Record<'login' | 'register' | 'forgot' | 'reset' | 'confirm' | 'resend' | 'me' | 'refresh' | 'logout', string>

export const DEFAULT_ENDPOINTS: AuthEndpoints = {
  login: '/auth/login', register: '/auth/register', forgot: '/auth/forgot-password', reset: '/auth/reset-password',
  confirm: '/auth/confirm-email', resend: '/auth/resend-confirmation', me: '/auth/me', refresh: '/auth/refresh', logout: '/auth/logout',
}

export const TYPES = `/** Who is signed in. Roles decide what they may see (see Show and the route guards). */
export type User = { id: string; email: string; name: string; roles: string[]; emailConfirmed: boolean }

/** What the API answers after signing in (refreshToken is optional). */
export type AuthResult = { user: User; accessToken: string; refreshToken?: string }

/** Register can sign in straight away, or ask the person to confirm their email first. */
export type RegisterResult = { needsConfirmation: true; email: string } | ({ needsConfirmation: false } & AuthResult)

export type RegisterInput = { name: string; email: string; password: string }
`

export const SESSION = `import { api } from '../api/client'
import type { AuthResult, User } from './types'

/** The signed-in session, kept in this browser. Route guards read it synchronously. */
const KEY = 'auth:session'
type Session = { user: User; accessToken: string; refreshToken?: string }

export function readSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Session | null
  } catch {
    return null
  }
}

export const currentUser = (): User | null => readSession()?.user ?? null

export function saveSession(result: AuthResult): void {
  localStorage.setItem(KEY, JSON.stringify(result))
}

export function updateUser(user: User): void {
  const session = readSession()
  if (session) localStorage.setItem(KEY, JSON.stringify({ ...session, user }))
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}

/** Every API call carries the access token. */
api.interceptors.request.use((config) => {
  const token = readSession()?.accessToken
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})

/** A 401 tries the refresh token once, then signs out (set by the AuthProvider). */
let refreshing: Promise<string | null> | null = null
export const sessionEvents = { onExpired: () => {}, refresh: async (): Promise<AuthResult | null> => null }

api.interceptors.response.use(undefined, async (error) => {
  const original = error.config
  if (error.response?.status !== 401 || !original || original.__retried) throw error
  original.__retried = true
  refreshing ??= sessionEvents.refresh().then((result) => {
    if (result) saveSession(result)
    return result?.accessToken ?? null
  }).finally(() => { refreshing = null })
  const token = await refreshing
  if (!token) {
    clearSession()
    sessionEvents.onExpired()
    throw error
  }
  original.headers.Authorization = \`Bearer \${token}\`
  return api(original)
})
`

/** src/auth/authApi.ts with the editor's endpoints. */
export function authApiSource(endpoints: AuthEndpoints): string {
  return `import { api, USE_MOCK } from '../api/client'
import * as mock from './authMock'
import { readSession } from './session'
import type { AuthResult, RegisterInput, RegisterResult, User } from './types'

/** Where the auth API lives (from the editor; relative to VITE_API_URL). Change them here if your API differs. */
export const ENDPOINTS = ${JSON.stringify(endpoints, null, 2)}

const post = async <T>(path: string, body?: unknown) => (await api.post<T>(path, body)).data

/** Every auth call: the mock (demo accounts) until VITE_USE_MOCK=false, then your API. */
export const authApi = {
  signIn: (email: string, password: string): Promise<AuthResult> => (USE_MOCK ? mock.signIn(email, password) : post(ENDPOINTS.login, { email, password })),
  register: (input: RegisterInput): Promise<RegisterResult> => (USE_MOCK ? mock.register(input) : post(ENDPOINTS.register, input)),
  forgotPassword: (email: string): Promise<void> => (USE_MOCK ? mock.forgotPassword(email) : post(ENDPOINTS.forgot, { email })),
  resetPassword: (token: string, password: string): Promise<void> => (USE_MOCK ? mock.resetPassword(token, password) : post(ENDPOINTS.reset, { token, password })),
  confirmEmail: (token: string): Promise<AuthResult> => (USE_MOCK ? mock.confirmEmail(token) : post(ENDPOINTS.confirm, { token })),
  resendConfirmation: (email: string): Promise<void> => (USE_MOCK ? mock.resendConfirmation(email) : post(ENDPOINTS.resend, { email })),
  me: async (): Promise<User> => (USE_MOCK ? mock.me(readSession()?.accessToken) : (await api.get<User>(ENDPOINTS.me)).data),
  refresh: (): Promise<AuthResult> => (USE_MOCK ? mock.refresh(readSession()?.accessToken) : post(ENDPOINTS.refresh, { refreshToken: readSession()?.refreshToken })),
  signOut: (): Promise<void> => (USE_MOCK ? Promise.resolve() : post(ENDPOINTS.logout)),
}
`
}
