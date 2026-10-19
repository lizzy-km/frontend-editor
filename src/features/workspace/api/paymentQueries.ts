import { collection, doc, getDoc, getDocs, query, Timestamp, where, type DocumentData, type DocumentSnapshot } from 'firebase/firestore/lite'
import { COLLECTIONS } from '@/lib/collections'
import { firestore } from '@/lib/firebase'

/** A payment record, as the Plans page shows it (written by the billing Worker, never by the app). */
export type PaymentRecord = { id: string; kind: string; ref: string; months: number | undefined; amountUsd: number; status: string; createdAt: number; paidAt: number | null }

const millis = (value: unknown) => (value instanceof Timestamp ? value.toMillis() : null)

function toPayment(snapshot: DocumentSnapshot<DocumentData>): PaymentRecord {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id, kind: String(data.kind ?? ''), ref: String(data.ref ?? ''), months: typeof data.months === 'number' ? data.months : undefined,
    amountUsd: Number(data.amountUsd ?? 0), status: String(data.status ?? 'pending'), createdAt: millis(data.createdAt) ?? Date.now(), paidAt: millis(data.paidAt),
  }
}

/** The person's payments, newest first (a handful per person: filtered by owner and sorted here, so no custom index). */
export async function listMyPayments(uid: string): Promise<PaymentRecord[]> {
  const snapshot = await getDocs(query(collection(firestore(), COLLECTIONS.payments), where('ownerId', '==', uid)))
  return snapshot.docs.map(toPayment).sort((a, b) => b.createdAt - a.createdAt)
}

/** One payment of the signed-in person, or null (missing, or someone else's: the rules refuse it). */
export async function getMyPayment(id: string): Promise<PaymentRecord | null> {
  try {
    const snapshot = await getDoc(doc(firestore(), COLLECTIONS.payments, id))
    return snapshot.exists() ? toPayment(snapshot) : null
  } catch {
    return null
  }
}
