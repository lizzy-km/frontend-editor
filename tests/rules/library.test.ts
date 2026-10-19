/** Security rules tests: the account component library (needs the emulator: npm run test:rules). */
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, type Firestore } from 'firebase/firestore'
import { describe, it } from 'vitest'
import { setupRules } from './rulesKit'

const { alice, bob } = setupRules()

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
