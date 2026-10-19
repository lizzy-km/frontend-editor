/**
 * Security rules tests. They need the Firestore emulator (Java + firebase-tools):
 *   npm run test:rules
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, type Firestore } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'tweak-rules', firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

const alice = () => env.authenticatedContext('alice').firestore() as unknown as Firestore
const bob = () => env.authenticatedContext('bob').firestore() as unknown as Firestore

async function seedUser(count = 0, plan = 'free', planUntil?: Date) {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore() as unknown as Firestore, 'tweak_users/alice'), { plan, projectCount: count, displayName: 'A', email: 'a@x', photoURL: null, ...(planUntil ? { planUntil } : {}) })
  })
}

/** The same batch the app sends (projectMutations.createProject). */
function createBatch(db: Firestore, id: string, isPublic = false) {
  const batch = writeBatch(db)
  batch.set(doc(db, `tweaks_projects/${id}`), { ownerId: 'alice', ownerName: 'A', name: 'P', isPublic, thumbnailUrl: null, remixOf: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  batch.set(doc(db, `tweaks_project_content/${id}`), { ownerId: 'alice', isPublic, doc: '{}', updatedAt: serverTimestamp() })
  batch.update(doc(db, 'tweak_users/alice'), { projectCount: increment(1), lastProjectOp: id })
  return batch
}

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

describe('component library', () => {
  const entry = (extra = {}) => ({ ownerId: 'alice', name: 'Card', data: '{}', version: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra })
  const ref = (db: Firestore, id = 'c1') => doc(db, `tweaks_components/${id}`)

  it('lets the owner save, read, update (version +1) and delete a component', async () => {
    await assertSucceeds(setDoc(ref(alice()), entry()))
    await assertSucceeds(getDoc(ref(alice())))
    await assertSucceeds(updateDoc(ref(alice()), { name: 'Card 2', data: '{"a":1}', version: 2, updatedAt: serverTimestamp() }))
    await assertSucceeds(deleteDoc(ref(alice())))
  })

  it('keeps it private: others can not read, change or delete it, and nobody can save as someone else', async () => {
    await assertSucceeds(setDoc(ref(alice()), entry()))
    await assertFails(getDoc(ref(bob())))
    await assertFails(updateDoc(ref(bob()), { name: 'x', version: 2, updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(ref(bob())))
    await assertFails(setDoc(ref(bob(), 'c2'), entry()))
  })

  it('refuses bad saves: wrong first version, extra fields, empty or huge content, a version that skips or goes back', async () => {
    await assertFails(setDoc(ref(alice()), entry({ version: 5 })))
    await assertFails(setDoc(ref(alice()), entry({ plan: 'pro' })))
    await assertFails(setDoc(ref(alice()), entry({ name: '' })))
    await assertFails(setDoc(ref(alice()), entry({ data: 'x'.repeat(200_001) })))
    await assertSucceeds(setDoc(ref(alice()), entry()))
    await assertFails(updateDoc(ref(alice()), { version: 3, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref(alice()), { version: 1, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref(alice()), { ownerId: 'bob', version: 2, updatedAt: serverTimestamp() }))
  })

  it('lets someone list only their own components', async () => {
    await assertSucceeds(setDoc(ref(alice()), entry()))
    await assertSucceeds(getDocs(query(collection(alice(), 'tweaks_components'), where('ownerId', '==', 'alice'))))
    await assertFails(getDocs(query(collection(bob(), 'tweaks_components'), where('ownerId', '==', 'alice'))))
  })
})

describe('plans and payments', () => {
  const DAY = 24 * 3600 * 1000
  const payment = { ownerId: 'alice', kind: 'plan', ref: 'pro', amountUsd: 6, status: 'paid' }

  it('lets a paid-up Pro save more than 10 pages, but not once the plan has run out', async () => {
    await seedUser(10, 'pro', new Date(Date.now() + 5 * DAY))
    await assertSucceeds(createBatch(alice(), 'p11').commit())
    await env.clearFirestore()
    await seedUser(10, 'pro', new Date(Date.now() - DAY))
    await assertFails(createBatch(alice(), 'p11').commit())
  })

  it('keeps a hand-granted Pro (no end date) working', async () => {
    await seedUser(10, 'pro')
    await assertSucceeds(createBatch(alice(), 'p11').commit())
  })

  it('never lets the browser change the plan or its end date', async () => {
    await seedUser(0)
    await assertFails(updateDoc(doc(alice(), 'tweak_users/alice'), { plan: 'pro' }))
    await assertFails(updateDoc(doc(alice(), 'tweak_users/alice'), { planUntil: new Date(Date.now() + 365 * DAY) }))
  })

  it('shows people their own payments only, and nobody can write one', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore() as unknown as Firestore, 'tweaks_payments/pay1'), payment)
    })
    await assertSucceeds(getDoc(doc(alice(), 'tweaks_payments/pay1')))
    await assertFails(getDoc(doc(bob(), 'tweaks_payments/pay1')))
    await assertFails(setDoc(doc(alice(), 'tweaks_payments/pay2'), { ...payment, status: 'paid' }))
    await assertFails(updateDoc(doc(alice(), 'tweaks_payments/pay1'), { status: 'refunded' }))
    await assertFails(deleteDoc(doc(alice(), 'tweaks_payments/pay1')))
    await assertSucceeds(getDocs(query(collection(alice(), 'tweaks_payments'), where('ownerId', '==', 'alice'))))
  })
})

describe('marketplace', () => {
  const listing = (extra = {}) => ({ ownerId: 'alice', sellerName: 'A', projectId: 'p1', title: 'Bakery', description: 'A bakery page', priceUsd: 12, thumbnailUrl: null, status: 'active', salesCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra })
  const ref = (db: Firestore, id = 'l1') => doc(db, `tweaks_listings/${id}`)

  async function seedProject() {
    await seedUser(0)
    await createBatch(alice(), 'p1').commit()
  }

  it('lets a seller list their own page, and nobody else\'s', async () => {
    await seedProject()
    await assertSucceeds(setDoc(ref(alice()), listing()))
    await assertFails(setDoc(ref(bob(), 'l2'), listing({ ownerId: 'bob' }))) // bob does not own p1
    await assertFails(setDoc(ref(alice(), 'l3'), listing({ ownerId: 'bob' })))
  })

  it('refuses bad listings: free or huge price, long words, made-up sales, extra fields, wrong status', async () => {
    await seedProject()
    for (const [index, bad] of [{ priceUsd: 0 }, { priceUsd: 501 }, { priceUsd: '5' }, { title: '' }, { description: 'x'.repeat(1001) }, { salesCount: 9 }, { status: 'removed' }, { featured: true }].entries()) {
      await assertFails(setDoc(ref(alice(), `bad${index}`), listing(bad)))
    }
  })

  it('shows active listings to everyone and paused ones only to the seller', async () => {
    await seedProject()
    await assertSucceeds(setDoc(ref(alice()), listing()))
    await assertSucceeds(setDoc(ref(alice(), 'l2'), listing({ status: 'paused' })))
    await assertSucceeds(getDoc(ref(bob())))
    await assertFails(getDoc(ref(bob(), 'l2')))
    await assertSucceeds(getDoc(ref(alice(), 'l2')))
    await assertSucceeds(getDocs(query(collection(bob(), 'tweaks_listings'), where('status', '==', 'active'))))
    await assertFails(getDocs(collection(bob(), 'tweaks_listings')))
  })

  it('lets the seller change the words, price and status but not the owner, project or sales', async () => {
    await seedProject()
    await assertSucceeds(setDoc(ref(alice()), listing()))
    await assertSucceeds(updateDoc(ref(alice()), { title: 'New', priceUsd: 20, status: 'paused', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref(alice()), { salesCount: 50, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref(alice()), { projectId: 'p2', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref(alice()), { ownerId: 'bob', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref(bob()), { title: 'mine', updatedAt: serverTimestamp() }))
  })

  it('only lets a listing that never sold be deleted', async () => {
    await seedProject()
    await assertSucceeds(setDoc(ref(alice()), listing()))
    await assertFails(deleteDoc(ref(bob())))
    await assertSucceeds(deleteDoc(ref(alice())))
    await env.withSecurityRulesDisabled(async (context) => { await setDoc(ref(context.firestore() as unknown as Firestore, 'sold'), listing({ salesCount: 2, createdAt: new Date(), updatedAt: new Date() })) })
    await assertFails(deleteDoc(ref(alice(), 'sold')))
  })

  it('shows orders to the buyer and the seller, the ledger and payouts to the seller, and lets nobody write them', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore() as unknown as Firestore
      await setDoc(doc(db, 'tweaks_orders/o1'), { buyerId: 'bob', sellerId: 'alice', status: 'delivered' })
      await setDoc(doc(db, 'tweaks_ledger/e1'), { sellerId: 'alice', amountUsd: 9 })
      await setDoc(doc(db, 'tweaks_payouts/x1'), { sellerId: 'alice', amountUsd: 20, status: 'requested' })
    })
    await assertSucceeds(getDoc(doc(alice(), 'tweaks_orders/o1')))
    await assertSucceeds(getDoc(doc(bob(), 'tweaks_orders/o1')))
    await assertFails(getDoc(doc(bob(), 'tweaks_ledger/e1')))
    await assertSucceeds(getDoc(doc(alice(), 'tweaks_ledger/e1')))
    await assertFails(getDoc(doc(bob(), 'tweaks_payouts/x1')))
    for (const path of ['tweaks_orders/o1', 'tweaks_ledger/e1', 'tweaks_payouts/x1']) {
      await assertFails(updateDoc(doc(alice(), path), { status: 'paid', amountUsd: 999 }))
      await assertFails(deleteDoc(doc(alice(), path)))
    }
    await assertFails(setDoc(doc(bob(), 'tweaks_orders/o2'), { buyerId: 'bob', sellerId: 'alice', status: 'delivered' }))
  })

  it('never lets the browser change a seller balance', async () => {
    await seedUser(0)
    await assertFails(updateDoc(doc(alice(), 'tweak_users/alice'), { earningsUsd: 1000 }))
  })
})
