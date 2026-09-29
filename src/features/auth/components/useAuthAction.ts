import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { startAuth, useAuthStore } from '../auth.store'
import { friendlyAuthError, isCancelled } from '../authErrors'

/** Where to go after signing in: ?next=/somewhere, else the projects page. */
export function useAfterSignIn() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = params.get('next')
  // Only same-site paths, never a full URL (avoids open redirects).
  return () => navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : '/projects', { replace: true })
}

/** On sign-in pages: start listening, and skip the page if already signed in. */
export function useRedirectIfSignedIn() {
  const status = useAuthStore((state) => state.status)
  const done = useAfterSignIn()
  useEffect(startAuth, [])
  useEffect(() => {
    if (status === 'signedIn') done()
  }, [status, done])
}

/** Runs an auth action with a busy flag and a friendly error message. */
export function useAuthAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (action: () => Promise<void>, onDone?: () => void) => {
    setBusy(true)
    setError('')
    try {
      await action()
      onDone?.()
    } catch (caught) {
      if (!isCancelled(caught)) setError(friendlyAuthError(caught))
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run }
}
