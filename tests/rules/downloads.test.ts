/**
 * Monthly download limit, enforced by firestore.rules. Uses the app's real
 * code (Firestore Lite) plus raw writes that try to cheat.
 */
import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite'
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, updateDoc, type Firestore as FullFirestore } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const PROJECT = 'demo-tweak'
let db: Firestore
vi.mock('@/lib/firebase', () => ({ firestore: () => db }))

let env: RulesTestEnvironment
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: PROJECT, firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':')
  db = getFirestore(initializeApp({ projectId: PROJECT, apiKey: 'demo' }, 'downloads'))
  connectFirestoreEmulator(db, host!, Number(port), { mockUserToken: { sub: 'alice', user_id: 'alice' } })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

const alice = { uid: 'alice', email: 'a@example.com', displayName: 'Alice', photoURL: null }
const page = { title: 'P', rootId: 'r', nodes: { r: { id: 'r', kind: 'element', tag: 'body', parentId: null, attrs: {}, styles: {}, children: [] } }, htmlAttrs: {}, css: '', links: [], scripts: [] }
const aliceRaw = () => env.authenticatedContext('alice').firestore() as unknown as FullFirestore

async function newPage(): Promise<string> {
  const { createProject } = await import('@/features/workspace/api/projectMutations')
  return createProject(alice, page as never)
}

async function download(id: string, times: number) {
  const { recordDownload } = await import('@/features/workspace/api/downloads')
  for (let i = 0; i < times; i++) await recordDownload(id, 'alice')
}

describe('download limit', () => {
  it('allows 10 a month on the free plan, then refuses', async () => {
    const id = await newPage()
    await download(id, 10)
    await expect(download(id, 1)).rejects.toThrow(/10 downloads/)
  })

  it('refuses skipping the app: jumping past the limit or resetting the count', async () => {
    const id = await newPage()
    await download(id, 10)
    const { downloadPeriod } = await import('@/features/workspace/api/downloads')
    await assertFails(updateDoc(doc(aliceRaw(), `tweaks_projects/${id}`), { downloadPeriod: downloadPeriod(), downloadCount: 11 }))
    await assertFails(updateDoc(doc(aliceRaw(), `tweaks_projects/${id}`), { downloadPeriod: downloadPeriod(), downloadCount: 1 }))
  })

  it('starts again in a new month', async () => {
    const id = await newPage()
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore() as unknown as FullFirestore, `tweaks_projects/${id}`), { downloadPeriod: 202001, downloadCount: 10 })
    })
    const { recordDownload } = await import('@/features/workspace/api/downloads')
    await expect(recordDownload(id, 'alice')).resolves.toEqual({ used: 1, max: 10 })
  })

  it('Pro has no limit', async () => {
    const id = await newPage()
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore() as unknown as FullFirestore, 'tweak_users/alice'), { plan: 'pro' })
    })
    await download(id, 12)
  })

  it("someone else can't use your page's downloads", async () => {
    const id = await newPage()
    const bob = env.authenticatedContext('bob').firestore() as unknown as FullFirestore
    await assertFails(updateDoc(doc(bob, `tweaks_projects/${id}`), { downloadPeriod: 202609, downloadCount: 1 }))
  })

  it("a new page can't start with a made-up count", async () => {
    await assertFails(setDoc(doc(aliceRaw(), 'tweaks_projects/x'), { ownerId: 'alice', isPublic: false, name: 'x', downloadCount: -100 }))
  })
})
