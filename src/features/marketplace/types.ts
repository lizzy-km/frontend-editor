/**
 * Marketplace records, as the screens use them (plain milliseconds, no Firestore types). People sell copies of their pages; a buyer
 * gets a private copy in their own workspace once the payment is confirmed. Everything about money is done by workers/billing.
 */

/** A page for sale (tweaks_listings/{id}). The seller manages it; `salesCount` is the worker's. */
export type Listing = {
  id: string
  ownerId: string
  sellerName: string
  projectId: string
  title: string
  description: string
  priceUsd: number
  thumbnailUrl: string | null
  status: 'active' | 'paused'
  salesCount: number
  createdAt: number
  updatedAt: number
}

/** What a seller fills in to list a page (or change a listing). */
export type ListingInput = { title: string; description: string; priceUsd: number; status: Listing['status'] }

/** A purchase (tweaks_orders/{id}), seen by the buyer and by the seller. */
export type Order = {
  id: string
  buyerId: string
  sellerId: string
  listingId: string
  title: string
  priceUsd: number
  feeUsd: number
  sellerEarningsUsd: number
  status: 'pending' | 'paid' | 'delivered'
  /** The buyer's copy, once delivered. */
  deliveredProjectId: string | null
  createdAt: number
}

/** One line of a seller's money history (tweaks_ledger/{id}): a sale (positive) or a payout held (negative). */
export type LedgerEntry = { id: string; type: string; title: string; amountUsd: number; feeUsd: number; createdAt: number }

/** A payout request (tweaks_payouts/{id}); a person pays it by hand. */
export type Payout = { id: string; amountUsd: number; wallet: string; status: 'requested' | 'paid' | 'cancelled'; createdAt: number }

/** The price range a listing may have (the rules enforce the same). */
export const LISTING_PRICE = { min: 1, max: 500 }

/** The share the platform keeps of a sale (the billing worker applies the real one: workers/billing/src/catalog.ts). */
export const MARKET_FEE_PERCENT = 10

/** The smallest payout (the billing worker enforces the same). */
export const MIN_PAYOUT_USD = 20
