/**
 * Security rules tests: profiles and pages. They need the Firestore emulator (Java + firebase-tools):
 *   npm run test:rules
 * More: library.test.ts (component library), commerce.test.ts (plans, payments, marketplace), appFlow.test.ts, downloads.test.ts.
 */
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { describe, it } from 'vitest'
import { setupRules } from './rulesKit'

const { alice, bob, seedUser, createBatch } = setupRules()

describe('users', () => {
  it('can create own profile only as free with 0 pages', async () => {
    const profile = { displayName: 'A', email: 'a@x', photoURL: null, createdAt: serverTimestamp() }
    await assertFails(setDoc(doc(alice(), 'tweak_users/alice'), { ...profile, plan: 'pro', projectCount: 0 }))
    await assertSucceeds(setDoc(doc(alice(), 'tweak_users/alice'), { ...profile, plan: 'free', projectCount: 0 }))
  })

  it('cannot lower the page counter on its own', async () => {
    await seedUser(5)
    await assertFails(updateDoc(doc(alice(), 'tweak_users/alice'), { projectCount: 0, lastProjectOp: 'x' }))
  })
})

describe('projects', () => {
  it('creates a project together with the counter', async () => {
    await seedUser(0)
    await assertSucceeds(createBatch(alice(), 'p1').commit())
  })

  it('refuses a new page when the profile is missing (the app creates it first)', async () => {
    await assertFails(createBatch(alice(), 'p1').commit())
    await setDoc(doc(alice(), 'tweak_users/alice'), { displayName: 'A', email: 'a@x', photoURL: null, plan: 'free', projectCount: 0, createdAt: serverTimestamp() })
    await assertSucceeds(createBatch(alice(), 'p1').commit())
  })

  it('refuses the 11th page on the free plan', async () => {
    await seedUser(10)
    await assertFails(createBatch(alice(), 'p11').commit())
  })

  it('refuses a project created without counting it', async () => {
    await seedUser(0)
    await assertFails(setDoc(doc(alice(), 'tweaks_projects/p1'), { ownerId: 'alice', isPublic: false, name: 'P' }))
  })

  it('hides private projects from others but shows public ones', async () => {
    await seedUser(0)
    await createBatch(alice(), 'p1').commit()
    await assertFails(getDoc(doc(bob(), 'tweaks_projects/p1')))
    await assertFails(getDoc(doc(bob(), 'tweaks_project_content/p1')))
    const db = alice() // one instance: a batch can't mix references from different instances
    const publish = writeBatch(db)
    publish.update(doc(db, 'tweaks_projects/p1'), { isPublic: true })
    publish.update(doc(db, 'tweaks_project_content/p1'), { isPublic: true })
    await assertSucceeds(publish.commit())
    await assertSucceeds(getDoc(doc(bob(), 'tweaks_project_content/p1')))
  })

  it('never lets someone else edit or take over a project', async () => {
    await seedUser(0)
    await createBatch(alice(), 'p1').commit()
    await assertFails(updateDoc(doc(bob(), 'tweaks_projects/p1'), { name: 'mine now' }))
    await assertFails(updateDoc(doc(alice(), 'tweaks_projects/p1'), { ownerId: 'bob' }))
  })
})
