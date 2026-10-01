import {
  createUserWithEmailAndPassword, getAdditionalUserInfo, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged,
  sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut,
  updateProfile, type User,
} from 'firebase/auth'
import { identifyUser, track } from '@/features/analytics/track'
import { firebaseAuth } from '@/lib/firebase'
import type { AppUser, OAuthProvider } from './types'
import { ensureUserProfile } from './userProfile'

/**
 * Everything that talks to Firebase Auth. This file is loaded lazily, so the
 * home page and "Try it" never download Firebase.
 */

export const toAppUser = (user: User): AppUser => ({
  uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL,
})

export function watchAuth(onChange: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth(), (firebaseUser) => {
    const user = firebaseUser ? toAppUser(firebaseUser) : null
    // Self-heal: a restored session may have no profile yet (e.g. the first
    // sign-in happened while the security rules refused the write).
    if (user) ensureUserProfile(user).catch((error) => console.warn('Profile check failed:', error))
    identifyUser(user?.uid ?? null)
    onChange(user)
  })
}

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password)
  await ensureUserProfile(toAppUser(user))
  track('login', { method: 'password' })
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password)
  if (name.trim()) await updateProfile(user, { displayName: name.trim() })
  await ensureUserProfile({ ...toAppUser(user), displayName: name.trim() || null })
  track('sign_up', { method: 'password' })
}

const PROVIDERS = {
  google: () => new GoogleAuthProvider(),
  github: () => new GithubAuthProvider(),
}

export async function signInWithProvider(provider: OAuthProvider) {
  const result = await signInWithPopup(firebaseAuth(), PROVIDERS[provider]())
  await ensureUserProfile(toAppUser(result.user))
  track(getAdditionalUserInfo(result)?.isNewUser ? 'sign_up' : 'login', { method: provider })
}

export const resetPassword = (email: string) => sendPasswordResetEmail(firebaseAuth(), email.trim())

export async function signOut() {
  track('logout')
  await firebaseSignOut(firebaseAuth())
}

/** Fresh ID token for calling our own services (the uploads worker). */
export async function getIdToken(): Promise<string | null> {
  return (await firebaseAuth().currentUser?.getIdToken()) ?? null
}
