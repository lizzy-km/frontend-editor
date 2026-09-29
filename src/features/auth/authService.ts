import {
  createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged,
  sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut,
  updateProfile, type User,
} from 'firebase/auth'
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
    onChange(user)
  })
}

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password)
  await ensureUserProfile(toAppUser(user))
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password)
  if (name.trim()) await updateProfile(user, { displayName: name.trim() })
  await ensureUserProfile({ ...toAppUser(user), displayName: name.trim() || null })
}

const PROVIDERS = {
  google: () => new GoogleAuthProvider(),
  github: () => new GithubAuthProvider(),
}

export async function signInWithProvider(provider: OAuthProvider) {
  const { user } = await signInWithPopup(firebaseAuth(), PROVIDERS[provider]())
  await ensureUserProfile(toAppUser(user))
}

export const resetPassword = (email: string) => sendPasswordResetEmail(firebaseAuth(), email.trim())

export const signOut = () => firebaseSignOut(firebaseAuth())

/** Fresh ID token for calling our own services (the uploads worker). */
export async function getIdToken(): Promise<string | null> {
  return (await firebaseAuth().currentUser?.getIdToken()) ?? null
}
