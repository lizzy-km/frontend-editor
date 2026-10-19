/** Security rules tests: plans, payments and the marketplace (needs the emulator: npm run test:rules). */
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, type Firestore } from 'firebase/firestore'
import { describe, it } from 'vitest'
import { setupRules } from './rulesKit'

const { alice, bob, seedUser, seed, createBatch } = setupRules()

describe('plans and payments', () => {
  const DAY = 24 * 3600 * 1000
  const payment = { ownerId: 'alice', kind: 'plan', ref: 'pro', amountUsd: 6, status: 'paid' }

  it('lets a paid-up Pro save more than 10 pages, but not once the plan has run out', async () => {
    await seedUser(10, 'pro', new Date(Date.now() + 5 * DAY))
    await assertSucceeds(createBatch(alice(), 'p11').commit())
    await seed('tweak_users/alice', { plan: 'pro', projectCount: 10, displayName: 'A', email: 'a@x', photoURL: null, planUntil: new Date(Date.now() - DAY) })
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
    await seed('tweaks_payments/pay1', payment)
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
    await seed('tweaks_listings/sold', listing({ salesCount: 2, createdAt: new Date(), updatedAt: new Date() }))
    await assertFails(deleteDoc(ref(alice(), 'sold')))
  })

  it('shows orders to the buyer and the seller, the ledger and payouts to the seller, and lets nobody write them', async () => {
    await seed('tweaks_orders/o1', { buyerId: 'bob', sellerId: 'alice', status: 'delivered' })
    await seed('tweaks_ledger/e1', { sellerId: 'alice', amountUsd: 9 })
    await seed('tweaks_payouts/x1', { sellerId: 'alice', amountUsd: 20, status: 'requested' })
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
