import { verifyFirebaseUser } from './auth'
import { restStore } from './firestoreRest'
import { serviceAccountToken } from './googleAuth'
import type { Env } from './http'
import type { Store } from './store'

/** What the handlers use from the outside world, so tests can replace each piece. */
export type Deps = {
  store: Store
  fetchFn: typeof fetch
  now: () => Date
  newId: () => string
  /** The signed-in person's uid from the request, or null. */
  userOf: (request: Request) => Promise<string | null>
}

/** The real dependencies for one request. */
export function realDeps(env: Env): Deps {
  return {
    store: restStore(env.FIREBASE_PROJECT_ID, () => serviceAccountToken(env.GOOGLE_SERVICE_ACCOUNT)),
    fetchFn: fetch,
    now: () => new Date(),
    newId: () => crypto.randomUUID().replace(/-/g, ''),
    userOf: (request) => verifyFirebaseUser(request, env.FIREBASE_PROJECT_ID),
  }
}
