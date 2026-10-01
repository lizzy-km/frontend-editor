/**
 * Firebase settings from .env. Kept apart from lib/firebase.ts on purpose:
 * UI code can check `isFirebaseConfigured` without pulling in the SDK.
 */
const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
}

/** False until .env is filled in — sign-in pages then explain that accounts are off. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

/** Analytics needs a measurement id (Project settings -> Your apps -> Web app). */
export const isAnalyticsConfigured = isFirebaseConfigured && Boolean(firebaseConfig.measurementId)
