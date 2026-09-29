import { create } from 'zustand'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { AppUser, AuthStatus } from './types'

type AuthState = {
  user: AppUser | null
  status: AuthStatus
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  status: isFirebaseConfigured ? 'loading' : 'unconfigured',
}))

let started = false

/**
 * Starts listening to sign-in changes (once). Firebase is imported here on
 * demand so pages that don't need accounts stay small.
 */
export function startAuth() {
  if (started || !isFirebaseConfigured) return
  started = true
  void import('./authService').then(({ watchAuth }) =>
    watchAuth((user) => useAuthStore.setState({ user, status: user ? 'signedIn' : 'signedOut' })),
  )
}

/** Loads the auth functions on demand (sign in, sign out...). */
export const authService = () => import('./authService')
