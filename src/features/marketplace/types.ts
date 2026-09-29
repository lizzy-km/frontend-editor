/**
 * P2P marketplace (planned, behind enable_marketplace). People sell copies of
 * their pages; buyers get a private copy in their workspace after paying.
 *
 * Planned Firestore shape (rules to be written with the feature):
 *   listings/{listingId}  -> Listing           (public read, seller writes)
 *   orders/{orderId}      -> Order             (buyer + seller read, server writes)
 * Payment confirmation and handing over the copy must run on a trusted
 * server, like plan upgrades (see features/billing/payments.ts).
 */

export type Currency = 'USDT' | 'USDC'

export type Listing = {
  id: string
  projectId: string
  sellerId: string
  sellerName: string
  title: string
  description: string
  priceAmount: number
  currency: Currency
  thumbnailUrl: string | null
  status: 'active' | 'paused' | 'removed'
  createdAt: number
}

export type Order = {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  priceAmount: number
  currency: Currency
  status: 'pending' | 'paid' | 'delivered' | 'refunded'
  /** The buyer's copy, once delivered. */
  deliveredProjectId: string | null
  createdAt: number
}
