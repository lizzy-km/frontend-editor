import { ROUTERS, type RouterKind } from './routerTemplates'

/** Mock auth for "signed-in only" pages: works with no backend, one place to plug in a real API. */
export const AUTH_PROVIDER = `import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

export type User = { email: string; name: string }

export type AuthState = {
  user: User | null
  /** Resolves when signed in; throws with a message to show when not. */
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'auth:user'

/** The signed-in user saved in this browser (null when signed out). Also used by route guards. */
export function currentUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as User | null
  } catch {
    return null
  }
}

/**
 * DEMO sign-in: any email with a password of 6+ characters works, and the
 * user is remembered in this browser. Replace the body of signIn with a call
 * to your API (e.g. POST /auth/login) and keep the rest as it is.
 */
async function demoSignIn(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  if (!/^\\S+@\\S+\\.\\S+$/.test(email)) throw new Error('Please enter a valid email address.')
  if (password.length < 6) throw new Error('The password needs at least 6 characters.')
  return { email, name: email.split('@')[0]! }
}

/** Wrap the app in this; read it with useAuth(). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(currentUser)

  const signIn = useCallback(async (email: string, password: string) => {
    const signedIn = await demoSignIn(email.trim(), password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signedIn))
    setUser(signedIn)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
`

export const USE_AUTH = `import { useContext } from 'react'
import { AuthContext, type AuthState } from './AuthProvider'

/** The signed-in user (or null), signIn and signOut. Use inside <AuthProvider>. */
export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}
`

/** Where a visitor wanted to go before being asked to sign in. */
const REDIRECT = "sessionStorage.getItem('auth:redirect') ?? '/'"

/** TanStack Router guards in the route itself (beforeLoad), before the page renders. */
const TANSTACK_GUARD = `import { redirect } from '@tanstack/react-router'
import { currentUser } from './AuthProvider'

/** Route guard (beforeLoad): visitors who aren't signed in go to /login and come back after signing in. */
export function requireSignIn({ location }: { location: { pathname: string } }) {
  if (currentUser()) return
  sessionStorage.setItem('auth:redirect', location.pathname)
  throw redirect({ to: '/login' })
}
`

/** src/auth/RequireAuth.tsx: the route guard (a wrapper for React Router, beforeLoad for TanStack). */
export const requireAuthSource = (kind: RouterKind) => kind === 'tanstack' ? TANSTACK_GUARD : `import type { ReactNode } from 'react'
import { Navigate, useLocation } from '${ROUTERS[kind].lib}'
import { useAuth } from './useAuth'

/** Shows the page only to signed-in visitors; everyone else goes to /login and comes back after signing in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    sessionStorage.setItem('auth:redirect', location.pathname)
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
`

/** src/pages/LoginPage.tsx */
export const loginPageSource = (kind: RouterKind) => `import { useState, type FormEvent } from 'react'
import { useNavigate } from '${ROUTERS[kind].lib}'
import { useAuth } from '../auth/useAuth'

/** Sign-in for the "signed-in only" pages (demo: any email, a 6+ character password). */
export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      const target = ${REDIRECT}
      sessionStorage.removeItem('auth:redirect')
      ${kind === 'react-router' ? 'navigate(target, { replace: true })' : '// The address is only known at run time, so it is not one of the typed routes.\n      void navigate({ to: target as never, replace: true })'}
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ maxWidth: 380, margin: '0 auto', padding: '96px 24px' }}>
      <h1>Sign in</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        <label style={{ display: 'grid', gap: 4 }}>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label style={{ display: 'grid', gap: 4 }}>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </section>
  )
}
`
