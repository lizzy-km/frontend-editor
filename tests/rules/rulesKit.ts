import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, increment, serverTimestamp, setDoc, writeBatch, type Firestore } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach } from 'vitest'

/**
 * Shared by the rules tests: starts the emulator with firestore.rules, clears it before each test and hands out the two signed-in
 * people (alice, bob) plus the helpers that make a profile and the same project batch the app sends.
 */
export function setupRules() {
  let env: RulesTestEnvironment
  beforeAll(async () => {
    env = await initializeTestEnvironment({ projectId: 'tweak-rules', firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
  })
  afterAll(() => env.cleanup())
  beforeEach(() => env.clearFirestore())

  const as = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore
  return {
    env: () => env,
    alice: () => as('alice'),
    bob: () => as('bob'),
    /** Alice's profile, written with the rules switched off. */
    async seedUser(count = 0, plan = 'free', planUntil?: Date) {
      await env.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore() as unknown as Firestore, 'tweak_users/alice'), { plan, projectCount: count, displayName: 'A', email: 'a@x', photoURL: null, ...(planUntil ? { planUntil } : {}) })
      })
    },
    /** Writes a document with the rules switched off. */
    async seed(path: string, data: Record<string, unknown>) {
      await env.withSecurityRulesDisabled(async (context) => { await setDoc(doc(context.firestore() as unknown as Firestore, path), data) })
    },
    /** The same batch the app sends (projectMutations.createProject). */
    createBatch(db: Firestore, id: string, isPublic = false) {
      const batch = writeBatch(db)
      batch.set(doc(db, `tweaks_projects/${id}`), { ownerId: 'alice', ownerName: 'A', name: 'P', isPublic, thumbnailUrl: null, remixOf: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      batch.set(doc(db, `tweaks_project_content/${id}`), { ownerId: 'alice', isPublic, doc: '{}', updatedAt: serverTimestamp() })
      batch.update(doc(db, 'tweak_users/alice'), { projectCount: increment(1), lastProjectOp: id })
      return batch
    },
  }
}
