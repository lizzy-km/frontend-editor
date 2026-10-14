import { ROUTERS, type RouterKind } from '../routerTemplates'

/** Route access: who may open a page (from the page's "Who can open this page"). */
export type Access = { roles: string[]; flags: string[]; signedOut: boolean; signedIn: boolean }

/** React Router: a wrapper around the page element. */
const REQUIRE_AUTH = `import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { isOn } from '../config/flags'
import NoAccessPage from '../pages/NoAccessPage'
import { useAuth } from './useAuth'

type Props = { children: ReactNode; roles?: string[]; flags?: string[]; signedOut?: boolean }

/**
 * Guards a page. Signed-in pages send visitors to /login (and back after
 * signing in); signed-out pages (login, register…) send signed-in people home;
 * missing roles or flags show "No access".
 */
export function RequireAuth({ children, roles = [], flags = [], signedOut = false }: Props) {
  const { user } = useAuth()
  const location = useLocation()
  if (signedOut) {
    if (!user) return <>{children}</>
    // Just signed in (or already was): on to the page they wanted, else home.
    return <Navigate to={sessionStorage.getItem('auth:redirect') ?? '/'} replace />
  }
  if (!user) {
    sessionStorage.setItem('auth:redirect', location.pathname)
    return <Navigate to="/login" replace />
  }
  const allowed = (!roles.length || roles.some((role) => user.roles.includes(role))) && (!flags.length || isOn(...flags))
  if (allowed) sessionStorage.removeItem('auth:redirect') // they got where they wanted
  return allowed ? <>{children}</> : <NoAccessPage />
}
`

/** TanStack Router: a beforeLoad check, before the page renders. */
const REQUIRE_ACCESS = `import { redirect } from '@tanstack/react-router'
import { isOn } from '../config/flags'
import { currentUser } from './session'

type Access = { roles?: string[]; flags?: string[]; signedOut?: boolean }

/**
 * Route guard for beforeLoad. Signed-in pages send visitors to /login (and back
 * after signing in); signed-out pages send signed-in people home; missing roles
 * or flags go to /no-access.
 */
export function requireAccess({ roles = [], flags = [], signedOut = false }: Access) {
  return ({ location }: { location: { pathname: string } }) => {
    const user = currentUser()
    if (signedOut) {
      if (user) throw redirect({ to: '/' })
      return
    }
    if (!user) {
      sessionStorage.setItem('auth:redirect', location.pathname)
      throw redirect({ to: '/login' })
    }
    const allowed = (!roles.length || roles.some((role) => user.roles.includes(role))) && (!flags.length || isOn(...flags))
    if (!allowed) throw redirect({ to: '/no-access' })
    sessionStorage.removeItem('auth:redirect') // they got where they wanted
  }
}
`

export const guardSource = (kind: RouterKind) => (kind === 'react-router' ? REQUIRE_AUTH : REQUIRE_ACCESS)

/** src/pages/NoAccessPage.tsx */
export const noAccessSource = (kind: RouterKind) => `import { Link } from '${ROUTERS[kind].lib}'

/** Shown when a signed-in person lacks the role (or flag) a page needs. */
export default function NoAccessPage() {
  return (
    <section style={{ padding: '96px 24px', textAlign: 'center' }}>
      <h1>No access</h1>
      <p>Your account can’t open this page. Ask an admin if you think it should.</p>
      <Link to="/">Back to the home page</Link>
    </section>
  )
}
`

/** The redirect after signing in: the page they wanted, else home. */
export const AFTER_SIGN_IN = "sessionStorage.getItem('auth:redirect') ?? '/'"

/** Wraps a route's page element (React Router) or adds beforeLoad (TanStack) for its access. */
export function routeGuard(kind: RouterKind, access: Access, element: string): { element: string; beforeLoad?: string } {
  const opts = [access.roles.length && `roles: ${JSON.stringify(access.roles)}`, access.flags.length && `flags: ${JSON.stringify(access.flags)}`, access.signedOut && 'signedOut: true'].filter(Boolean)
  const guarded = access.signedIn || access.signedOut || access.flags.length > 0
  if (!guarded) return { element }
  if (kind === 'tanstack') return { element, beforeLoad: `requireAccess(${opts.length ? `{ ${opts.join(', ')} }` : '{}'})` }
  const props = [access.roles.length && `roles={${JSON.stringify(access.roles)}}`, access.flags.length && `flags={${JSON.stringify(access.flags)}}`, access.signedOut && 'signedOut'].filter(Boolean)
  return { element: `<RequireAuth${props.length ? ` ${props.join(' ')}` : ''}>${element}</RequireAuth>` }
}
