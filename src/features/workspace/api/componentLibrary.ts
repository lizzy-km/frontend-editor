import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore/lite'
import type { LibraryEntry } from '@/features/editor/model/reuse/entry'
import { COLLECTIONS } from '@/lib/collections'
import { firestore } from '@/lib/firebase'
import { packValue, unpackValue } from './packDoc'
import { ProjectTooBigError } from './types'

/** One saved component of the signed-in person's library. */
export type LibraryItem = { id: string; name: string; version: number; updatedAt: number; entry: LibraryEntry }

/** Firestore documents may be 1 MiB; the rules cap a saved component at 200,000 characters. */
const MAX_CHARS = 200_000

const col = () => collection(firestore(), COLLECTIONS.components)

async function pack(entry: LibraryEntry): Promise<string> {
  const data = await packValue(entry)
  if (data.length > MAX_CHARS) throw new ProjectTooBigError('usually because of pictures pasted inside the code')
  return data
}

/** The person's saved components, newest change first (sorted here: a plain filter needs no custom index). */
export async function listLibrary(uid: string): Promise<LibraryItem[]> {
  const snapshot = await getDocs(query(col(), where('ownerId', '==', uid)))
  const items = await Promise.all(snapshot.docs.map(async (item) => {
    const data = item.data()
    try {
      const entry = await unpackValue<LibraryEntry>(String(data.data))
      const stamp = data.updatedAt as { toMillis?: () => number } | undefined
      return { id: item.id, name: String(data.name ?? entry.name), version: Number(data.version ?? 1), updatedAt: stamp?.toMillis?.() ?? Date.now(), entry }
    } catch {
      return null // a component this browser can't read is left out, never breaks the list
    }
  }))
  return items.filter((item): item is LibraryItem => item !== null).sort((a, b) => b.updatedAt - a.updatedAt)
}

/** Saves a component as a new library entry (version 1). Returns its id. */
export async function saveToLibrary(uid: string, entry: LibraryEntry): Promise<string> {
  const data = await pack(entry)
  const created = await addDoc(col(), { ownerId: uid, name: entry.name, data, version: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return created.id
}

/** Saves a newer version of an entry (the version goes up by one, as the rules insist). Returns the new version. */
export async function updateLibraryEntry(id: string, entry: LibraryEntry, currentVersion: number): Promise<number> {
  const version = currentVersion + 1
  await updateDoc(doc(firestore(), COLLECTIONS.components, id), { name: entry.name, data: await pack(entry), version, updatedAt: serverTimestamp() })
  return version
}

/** Removes an entry from the library (pages that already use it keep their copy). */
export const deleteLibraryEntry = (id: string): Promise<void> => deleteDoc(doc(firestore(), COLLECTIONS.components, id))
