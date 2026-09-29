import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PageSpinner } from '@/shared/ui'
import { startAuth, useAuthStore } from './auth.store'

/** Wraps pages that need an account. Sends signed-out people to sign in, then back. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()
  useEffect(startAuth, [])

  if (status === 'loading') return <PageSpinner />
  if (status !== 'signedIn') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}
