import { create } from 'zustand'
import { isFirebaseConfigured } from '@/lib/firebaseConfig'
import type { AppUser, AuthStatus } from './types'

type AuthState = {
  user: AppUser | null
  status: AuthStatus
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  status: isFirebaseConfigured ? 'loading' : 'unconfigured',
}))

const HINT_KEY = 'tweak:signed-in'

/** Cheap "was signed in last time" flag, so light pages (home) can say "My pages" without Firebase. */
export function wasSignedIn(): boolean {
  try { return localStorage.getItem(HINT_KEY) === '1' } catch { return false }
}

function rememberSignedIn(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(HINT_KEY, '1')
    else localStorage.removeItem(HINT_KEY)
  } catch { /* storage blocked: the hint is optional */ }
}

let started = false

/**
 * Starts listening to sign-in changes (once). Firebase is imported here on
 * demand so pages that don't need accounts stay small.
 */
export function startAuth() {
  if (started || !isFirebaseConfigured) return
  started = true
  void import('./authService').then(({ watchAuth }) =>
    watchAuth((user) => {
      rememberSignedIn(Boolean(user))
      useAuthStore.setState({ user, status: user ? 'signedIn' : 'signedOut' })
    }),
  )
}

/** Loads the auth functions on demand (sign in, sign out...). */
export const authService = () => import('./authService')
