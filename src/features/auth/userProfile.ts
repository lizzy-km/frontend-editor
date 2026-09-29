import { doc, runTransaction, serverTimestamp } from 'firebase/firestore/lite'
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
 * Makes sure users/{uid} has what this app needs, in one transaction (so two
 * checks at once — sign-in + session restore — can't collide).
 * - Missing: create it (rules allow only plan "free", projectCount 0).
 * - Exists but without our fields (e.g. made by another app in the same
 *   Firebase project): add projectCount 0 (+ plan "free" if absent) and
 *   leave everything else alone.
 */
export async function ensureUserProfile(user: AppUser): Promise<void> {
  const ref = doc(firestore(), 'users', user.uid)
  await runTransaction(firestore(), async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      transaction.set(ref, {
        displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Friend',
        email: user.email ?? '',
        photoURL: user.photoURL,
        plan: 'free',
        projectCount: 0,
        createdAt: serverTimestamp(),
      })
      return
    }
    const data = snapshot.data()
    if (typeof data.projectCount === 'number') return
    transaction.update(ref, 'plan' in data ? { projectCount: 0 } : { projectCount: 0, plan: 'free' })
  })
}
