import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore/lite'
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig'

/**
 * The Firebase SDK. Only import this from lazily-loaded code (auth service,
 * workspace/gallery pages) so it never lands in the first page load.
 */
let app: FirebaseApp | undefined

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Fill in .env (see .env.example).')
  app ??= initializeApp(firebaseConfig)
  return app
}

export const firebaseAuth = (): Auth => getAuth(getApp())
export const firestore = (): Firestore => getFirestore(getApp())
