import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite'
import { firestore } from '@/lib/firebase'
import type { AppUser } from './types'

/** Stored at users/{uid}. The workspace limit and plan live here. */
export type UserProfile = {
  displayName: string
  email: string
  photoURL: string | null
  plan: 'free' | 'pro'
  projectCount: number
}

/**
 * Creates the profile the first time someone signs in. Security rules only
 * allow creating it with plan "free" and projectCount 0.
 */
export async function ensureUserProfile(user: AppUser): Promise<void> {
  const ref = doc(firestore(), 'users', user.uid)
  const existing = await getDoc(ref)
  if (existing.exists()) return
  await setDoc(ref, {
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Friend',
    email: user.email ?? '',
    photoURL: user.photoURL,
    plan: 'free',
    projectCount: 0,
    createdAt: serverTimestamp(),
  })
}
