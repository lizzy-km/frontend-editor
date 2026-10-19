import { LISTING_PRICE, MARKET_FEE_PERCENT, money } from './catalog'
import { startPayment } from './startPayment'
import type { Deps } from './deps'
import type { Env } from './http'
import { json } from './http'

/**
 * Buying a listing: checks it is for sale and the seller's page still exists, then records an order and a pending payment
 * together. The price is the listing's, read here (never the browser's); the fee is fixed on the order now.
 */
export async function checkoutOrder(env: Env, deps: Deps, uid: string, listingId: string | undefined, cors: Record<string, string>): Promise<Response> {
  if (!listingId || !/^[A-Za-z0-9_-]{1,64}$/.test(listingId)) return json({ error: 'Unknown page.' }, 400, cors)
  const listing = await deps.store.get(`tweaks_listings/${listingId}`)
  const price = Number(listing?.data.priceUsd)
  if (!listing || listing.data.status !== 'active' || !(price >= LISTING_PRICE.min && price <= LISTING_PRICE.max)) return json({ error: 'This page is not for sale any more.' }, 404, cors)
  const sellerId = String(listing.data.ownerId)
  if (sellerId === uid) return json({ error: 'You cannot buy your own page.' }, 400, cors)
  const project = await deps.store.get(`tweaks_projects/${String(listing.data.projectId)}`)
  if (!project || project.data.ownerId !== sellerId) return json({ error: 'This page is not available any more.' }, 409, cors)
  const mine = await deps.store.find('tweaks_orders', 'buyerId', uid)
  if (mine.some((order) => order.data.listingId === listingId && (order.data.status === 'delivered' || order.data.status === 'paid'))) return json({ error: 'You already bought this page. Find it in My pages.' }, 409, cors)

  const orderId = deps.newId()
  const feeUsd = money((price * MARKET_FEE_PERCENT) / 100)
  const now = deps.now()
  const title = String(listing.data.title)
  return startPayment(env, deps, {
    ownerId: uid, kind: 'order', ref: orderId, amountUsd: money(price), description: `Tweak page: ${title}`.slice(0, 120), returnPath: '/market/orders',
    before: [{ path: `tweaks_orders/${orderId}`, data: { buyerId: uid, sellerId, listingId, projectId: String(listing.data.projectId), title, priceUsd: money(price), feeUsd, sellerEarningsUsd: money(price - feeUsd), status: 'pending', createdAt: now, updatedAt: now }, expect: { absent: true } }],
  }, cors)
}
