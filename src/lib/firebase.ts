import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const env = import.meta.env

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

/** False until .env is filled in — the app then shows a setup screen for sign-in. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId)

let app: FirebaseApp | undefined

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Fill in .env (see .env.example).')
  app ??= initializeApp(config)
  return app
}

export const firebaseAuth = (): Auth => getAuth(getApp())
export const firestore = (): Firestore => getFirestore(getApp())
