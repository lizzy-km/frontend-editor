import { money } from './catalog'
import type { Fulfiller } from './fulfil'
import type { Write } from './store'

/** The order record (tweaks_orders/{id}), as the worker reads it. */
export type Order = { buyerId: string; sellerId: string; listingId: string; projectId: string; title: string; priceUsd: number; feeUsd: number; sellerEarningsUsd: number; status: string }

/**
 * A confirmed purchase: the buyer gets their own private copy of the page (a new project, counted on their profile), the seller is
 * credited the sale minus the platform fee (ledger entry + balance), the listing counts the sale, and the order becomes "delivered".
 * If the seller's page is gone, nothing is handed over or credited and the order is flagged for a person to look at.
 */
export const fulfilOrder: Fulfiller = async (store, payment, now, newId) => {
  const orderPath = `tweaks_orders/${payment.data.ref as string}`
  const order = await store.get(orderPath)
  if (!order || order.data.status === 'delivered') return []
  const data = order.data as unknown as Order
  const [content, listing, buyer, seller] = await Promise.all([
    store.get(`tweaks_project_content/${data.projectId}`), store.get(`tweaks_listings/${data.listingId}`),
    store.get(`tweak_users/${data.buyerId}`), store.get(`tweak_users/${data.sellerId}`),
  ])
  if (!content || content.data.ownerId !== data.sellerId || typeof content.data.doc !== 'string') {
    return [{ path: orderPath, data: { status: 'paid', needsReview: true, note: 'The seller\'s page was not found, so nothing was delivered.', updatedAt: now }, merge: true, expect: { updateTime: order.updateTime } }]
  }
  const projectId = newId()
  const guard = (doc: { updateTime: string } | null) => (doc ? { expect: { updateTime: doc.updateTime } } : {})
  const writes: Write[] = [
    { path: `tweaks_projects/${projectId}`, data: { ownerId: data.buyerId, ownerName: String(buyer?.data.displayName ?? 'Someone'), name: data.title, isPublic: false, thumbnailUrl: listing?.data.thumbnailUrl ?? null, remixOf: null, boughtFrom: data.listingId, createdAt: now, updatedAt: now }, expect: { absent: true } },
    { path: `tweaks_project_content/${projectId}`, data: { ownerId: data.buyerId, isPublic: false, doc: content.data.doc, updatedAt: now }, expect: { absent: true } },
    { path: `tweak_users/${data.buyerId}`, data: { projectCount: Number(buyer?.data.projectCount ?? 0) + 1, lastProjectOp: projectId }, merge: true, ...guard(buyer) },
    { path: `tweak_users/${data.sellerId}`, data: { earningsUsd: money(Number(seller?.data.earningsUsd ?? 0) + data.sellerEarningsUsd) }, merge: true, ...guard(seller) },
    { path: `tweaks_ledger/sale_${order.path.split('/')[1]}`, data: { sellerId: data.sellerId, type: 'sale', orderId: order.path.split('/')[1], title: data.title, amountUsd: data.sellerEarningsUsd, feeUsd: data.feeUsd, createdAt: now }, expect: { absent: true } },
    { path: orderPath, data: { status: 'delivered', deliveredProjectId: projectId, updatedAt: now }, merge: true, expect: { updateTime: order.updateTime } },
  ]
  if (listing) writes.push({ path: listing.path, data: { salesCount: Number(listing.data.salesCount ?? 0) + 1 }, merge: true, expect: { updateTime: listing.updateTime } })
  return writes
}
