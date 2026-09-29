/**
 * Runs the app's REAL Firestore code (Firestore Lite, same as the browser)
 * against the emulator and the real rules: sign-in profile, then New page.
 * If this passes but production refuses, the difference is in deployed rules
 * or existing data — not in the code.
 */
import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const PROJECT = 'demo-tweak'
let db: Firestore

vi.mock('@/lib/firebase', () => ({ firestore: () => db }))

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: PROJECT, firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':')
  db = getFirestore(initializeApp({ projectId: PROJECT, apiKey: 'demo' }, 'app-flow'))
  connectFirestoreEmulator(db, host!, Number(port), { mockUserToken: { sub: 'alice', user_id: 'alice' } })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

const alice = { uid: 'alice', email: 'a@example.com', displayName: 'Alice', photoURL: null }
const page = { title: 'Untitled page', rootId: 'r', nodes: { r: { id: 'r', kind: 'element', tag: 'body', parentId: null, attrs: {}, styles: {}, children: [] } }, htmlAttrs: {}, css: '', links: [], scripts: [] }

describe('app flow with Firestore Lite', () => {
  it('first sign-in creates the profile, then New page works', async () => {
    const { ensureUserProfile } = await import('@/features/auth/userProfile')
    const { createProject } = await import('@/features/workspace/api/projectMutations')
    await ensureUserProfile(alice)
    const id = await createProject(alice, page as never)
    expect(id).toBeTruthy()
  })

  it('New page works even when the profile was never created', async () => {
    const { createProject } = await import('@/features/workspace/api/projectMutations')
    await expect(createProject(alice, page as never)).resolves.toBeTruthy()
  })

  it('New page works when users/{uid} already exists from ANOTHER app (no plan/projectCount)', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const { doc, setDoc } = await import('firebase/firestore')
      await setDoc(doc(context.firestore(), 'users/alice'), { name: 'Alice', role: 'customer' })
    })
    const { createProject } = await import('@/features/workspace/api/projectMutations')
    await expect(createProject(alice, page as never)).resolves.toBeTruthy()
  })

  it('profile check running twice at once (session restore + New page) does not break', async () => {
    const { ensureUserProfile } = await import('@/features/auth/userProfile')
    const { createProject } = await import('@/features/workspace/api/projectMutations')
    await Promise.all([ensureUserProfile(alice), ensureUserProfile(alice)])
    await expect(createProject(alice, page as never)).resolves.toBeTruthy()
  })
})
