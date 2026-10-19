import { collection, getDoc, getDocs, query, Timestamp, where, doc, type DocumentData, type DocumentSnapshot } from 'firebase/firestore/lite'
import type { LedgerEntry, Order, Payout } from '@/features/marketplace/types'
import { COLLECTIONS } from '@/lib/collections'
import { firestore } from '@/lib/firebase'

const millis = (value: unknown) => (value instanceof Timestamp ? value.toMillis() : Date.now())
const fetchBy = async (name: string, field: string, uid: string) => (await getDocs(query(collection(firestore(), name), where(field, '==', uid)))).docs

function toOrder(snapshot: DocumentSnapshot<DocumentData>): Order {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id, buyerId: String(data.buyerId ?? ''), sellerId: String(data.sellerId ?? ''), listingId: String(data.listingId ?? ''), title: String(data.title ?? ''),
    priceUsd: Number(data.priceUsd ?? 0), feeUsd: Number(data.feeUsd ?? 0), sellerEarningsUsd: Number(data.sellerEarningsUsd ?? 0),
    status: data.status === 'delivered' || data.status === 'paid' ? data.status : 'pending',
    deliveredProjectId: typeof data.deliveredProjectId === 'string' ? data.deliveredProjectId : null, createdAt: millis(data.createdAt),
  }
}

const newest = <T extends { createdAt: number }>(a: T, b: T) => b.createdAt - a.createdAt

/** What the person bought, and what they sold (two small lists, newest first). */
export async function listMyOrders(uid: string): Promise<{ bought: Order[]; sold: Order[] }> {
  const [bought, sold] = await Promise.all([fetchBy(COLLECTIONS.orders, 'buyerId', uid), fetchBy(COLLECTIONS.orders, 'sellerId', uid)])
  return { bought: bought.map(toOrder).sort(newest), sold: sold.map(toOrder).sort(newest) }
}

/** The seller's money history, newest first. */
export async function listMyLedger(uid: string): Promise<LedgerEntry[]> {
  return (await fetchBy(COLLECTIONS.ledger, 'sellerId', uid)).map((item) => {
    const data = item.data()
    return { id: item.id, type: String(data.type ?? ''), title: String(data.title ?? ''), amountUsd: Number(data.amountUsd ?? 0), feeUsd: Number(data.feeUsd ?? 0), createdAt: millis(data.createdAt) }
  }).sort(newest)
}

/** The seller's payout requests, newest first. */
export async function listMyPayouts(uid: string): Promise<Payout[]> {
  return (await fetchBy(COLLECTIONS.payouts, 'sellerId', uid)).map((item) => {
    const data = item.data()
    const status = data.status === 'paid' || data.status === 'cancelled' ? data.status : 'requested'
    return { id: item.id, amountUsd: Number(data.amountUsd ?? 0), wallet: String(data.wallet ?? ''), status, createdAt: millis(data.createdAt) } satisfies Payout
  }).sort(newest)
}

/** What the seller can ask to be paid out now (the billing worker keeps it up to date). */
export async function getBalance(uid: string): Promise<number> {
  return Number((await getDoc(doc(firestore(), COLLECTIONS.users, uid))).data()?.earningsUsd ?? 0)
}
