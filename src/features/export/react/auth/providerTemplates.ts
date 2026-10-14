/** The exported project's AuthProvider, useAuth, Show and feature flags. */

export const AUTH_PROVIDER = `import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { USE_MOCK } from '../api/client'
import { authApi } from './authApi'
import { clearSession, currentUser, readSession, saveSession, sessionEvents, updateUser } from './session'
import type { RegisterInput, RegisterResult, User } from './types'

export type AuthState = {
  user: User | null
  signIn: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<RegisterResult>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  confirmEmail: (token: string) => Promise<User>
  resendConfirmation: (email: string) => Promise<void>
  signOut: () => Promise<void>
  /** Does the signed-in user have one of these roles? */
  hasRole: (...roles: string[]) => boolean
}

export const AuthContext = createContext<AuthState | null>(null)

/** Wrap the app in this; read it anywhere with useAuth(). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(currentUser)

  useEffect(() => {
    sessionEvents.onExpired = () => setUser(null)
    sessionEvents.refresh = () => authApi.refresh().catch(() => null)
    // Signed in from an earlier visit: check the user is still valid (and pick up new roles).
    if (readSession() && !USE_MOCK) {
      authApi.me().then((fresh) => { updateUser(fresh); setUser(fresh) }).catch(() => {})
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authApi.signIn(email.trim(), password)
    saveSession(result)
    setUser(result.user)
    return result.user
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register({ ...input, email: input.email.trim() })
    if (!result.needsConfirmation) {
      saveSession(result)
      setUser(result.user)
    }
    return result
  }, [])

  const confirmEmail = useCallback(async (token: string) => {
    const result = await authApi.confirmEmail(token)
    saveSession(result)
    setUser(result.user)
    return result.user
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut().catch(() => {})
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(() => ({
    user, signIn, register, confirmEmail, signOut,
    forgotPassword: authApi.forgotPassword,
    resetPassword: authApi.resetPassword,
    resendConfirmation: authApi.resendConfirmation,
    hasRole: (...roles: string[]) => Boolean(user && roles.some((role) => user.roles.includes(role))),
  }), [user, signIn, register, confirmEmail, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
`

export const USE_AUTH = `import { useContext } from 'react'
import { AuthContext, type AuthState } from './AuthProvider'

/** The signed-in user (or null) and every auth action. Use inside <AuthProvider>. */
export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}
`

/** src/auth/signOut.ts: for "Log out" buttons that are not inside a component using useAuth(). */
export const SIGN_OUT = `import { authApi } from './authApi'
import { clearSession, sessionEvents } from './session'

/** Signs out: tells the API, forgets the session and lets the AuthProvider (and the route guards) know. */
export async function signOut(): Promise<void> {
  await authApi.signOut().catch(() => {})
  clearSession()
  sessionEvents.onExpired()
  // Reload so every route guard checks again (TanStack's run on navigation only).
  window.location.reload()
}
`

export const SHOW = `import type { ReactNode } from 'react'
import { isOn } from '../config/flags'
import { useAuth } from './useAuth'

/** Who sees something: signed in or out, any of some roles, and flags that must be on. */
export type When = { signedIn?: boolean; roles?: string[]; flags?: string[] }

/** Shows its children only when "when" matches (else the fallback, nothing by default). */
export function Show({ when, children, fallback = null }: { when: When; children: ReactNode; fallback?: ReactNode }) {
  const { user } = useAuth()
  const signedIn = Boolean(user)
  const visible = (when.signedIn === undefined || when.signedIn === signedIn)
    && (!when.roles?.length || when.roles.some((role) => user?.roles.includes(role)))
    && (!when.flags?.length || isOn(...when.flags))
  return <>{visible ? children : fallback}</>
}
`

/** src/config/flags.ts with the site's flags (all off; turn on here or with VITE_FLAGS). */
export function flagsSource(flags: string[]): string {
  return `/**
 * Feature flags from the editor. Turn one on here, or for one build with
 * VITE_FLAGS=beta,newCheckout in .env.
 */
const fromEnv = (import.meta.env.VITE_FLAGS ?? '').split(',').map((flag: string) => flag.trim()).filter(Boolean)

export const flags: Record<string, boolean> = {
${flags.map((flag) => `  ${JSON.stringify(flag)}: false,`).join('\n')}
  ...Object.fromEntries(fromEnv.map((flag: string) => [flag, true])),
}

/** Are all these flags on? */
export const isOn = (...names: string[]) => names.every((name) => flags[name] === true)
`
}
