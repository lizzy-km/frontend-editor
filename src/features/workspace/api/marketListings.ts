import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, Timestamp, updateDoc, where, type DocumentData, type DocumentSnapshot } from 'firebase/firestore/lite'
import type { Listing, ListingInput } from '@/features/marketplace/types'
import { COLLECTIONS } from '@/lib/collections'
import { firestore } from '@/lib/firebase'

const col = () => collection(firestore(), COLLECTIONS.listings)
const millis = (value: unknown) => (value instanceof Timestamp ? value.toMillis() : Date.now())

/** Firestore document -> Listing (timestamps become plain milliseconds). */
export function toListing(snapshot: DocumentSnapshot<DocumentData>): Listing {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id, ownerId: String(data.ownerId ?? ''), sellerName: String(data.sellerName ?? ''), projectId: String(data.projectId ?? ''),
    title: String(data.title ?? ''), description: String(data.description ?? ''), priceUsd: Number(data.priceUsd ?? 0),
    thumbnailUrl: typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : null, status: data.status === 'paused' ? 'paused' : 'active',
    salesCount: Number(data.salesCount ?? 0), createdAt: millis(data.createdAt), updatedAt: millis(data.updatedAt),
  }
}

const newestFirst = (a: Listing, b: Listing) => b.createdAt - a.createdAt

/** Everything for sale, newest first (filtered by the rules' own condition and sorted here: no custom index). */
export async function listActiveListings(): Promise<Listing[]> {
  return (await getDocs(query(col(), where('status', '==', 'active')))).docs.map(toListing).sort(newestFirst)
}

/** One listing, or null (missing, or paused and not yours: the rules refuse it). */
export async function getListing(id: string): Promise<Listing | null> {
  try {
    const snapshot = await getDoc(doc(col(), id))
    return snapshot.exists() ? toListing(snapshot) : null
  } catch {
    return null
  }
}

/** The person's own listings, active and paused. */
export async function listMyListings(uid: string): Promise<Listing[]> {
  return (await getDocs(query(col(), where('ownerId', '==', uid)))).docs.map(toListing).sort(newestFirst)
}

/** Puts one of the person's pages up for sale. Returns the listing's id. */
export async function createListing(seller: { uid: string; name: string }, project: { id: string; thumbnailUrl: string | null }, input: ListingInput): Promise<string> {
  const now = serverTimestamp()
  const created = await addDoc(col(), {
    ownerId: seller.uid, sellerName: seller.name, projectId: project.id, title: input.title.trim(), description: input.description.trim(), priceUsd: input.priceUsd,
    thumbnailUrl: project.thumbnailUrl, status: input.status, salesCount: 0, createdAt: now, updatedAt: now,
  })
  return created.id
}

/** Changes the words, price or status of a listing. */
export async function updateListing(id: string, input: ListingInput): Promise<void> {
  await updateDoc(doc(col(), id), { title: input.title.trim(), description: input.description.trim(), priceUsd: input.priceUsd, status: input.status, updatedAt: serverTimestamp() })
}

/** Takes a listing that never sold off the market (the rules refuse once it has sold: pause it instead). */
export const deleteListing = (id: string): Promise<void> => deleteDoc(doc(col(), id))
