// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { handleCheckout } from './checkout'
import type { Deps } from './deps'
import { signatureOf } from './nowpayments'
import { handlePayout } from './payout'
import type { Store } from './store'
import { ENV, NOW, testDeps } from './testKit'
import { handleWebhook } from './webhook'

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://worker.test${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://app.test', ...headers }, body: JSON.stringify(body) })

/** A seller (carol) with a project and an active $20 listing, and a buyer (alice) with a profile. */
async function market(options: { uid?: string | null; listing?: Record<string, unknown>; skipContent?: boolean } = {}) {
  const kit = testDeps({ uid: options.uid })
  const { store } = kit
  await store.commit([
    { path: 'tweaks_projects/p1', data: { ownerId: 'carol', name: 'Bakery' } },
    ...(options.skipContent ? [] : [{ path: 'tweaks_project_content/p1', data: { ownerId: 'carol', isPublic: false, doc: '{"title":"Bakery"}' } }]),
    { path: 'tweaks_listings/l1', data: { ownerId: 'carol', projectId: 'p1', title: 'Bakery', priceUsd: 20, status: 'active', salesCount: 0, thumbnailUrl: 'https://img.test/t.png', ...options.listing } },
    { path: 'tweak_users/alice', data: { displayName: 'Alice', projectCount: 2, plan: 'free' } },
    { path: 'tweak_users/carol', data: { displayName: 'Carol', projectCount: 1, earningsUsd: 5 } },
  ])
  return kit
}
const buy = (deps: Deps) => handleCheckout(post('/checkout', { kind: 'order', listingId: 'l1', priceUsd: 0.01 }), ENV, deps)
const data = (store: ReturnType<typeof testDeps>['store'], path: string) => store.docs.get(path)?.data

async function pay(deps: Deps, paymentId: string, amount: number, status = 'finished') {
  const body = { payment_status: status, order_id: paymentId, price_amount: amount, price_currency: 'usd', payment_id: 7 }
  return handleWebhook(post('/webhook/nowpayments', body, { 'x-nowpayments-sig': await signatureOf(ENV.NOWPAYMENTS_IPN_SECRET, body) }), ENV, deps)
}

describe('buying a listing (checkout)', () => {
  it('records an order at the listing\'s price with the fee fixed, and a payment for it', async () => {
    const { deps, store, calls } = await market()
    const response = await buy(deps)
    expect(await response.json()).toMatchObject({ checkoutUrl: 'https://pay.test/inv1' })
    expect(data(store, 'tweaks_orders/pay000001')).toMatchObject({ buyerId: 'alice', sellerId: 'carol', listingId: 'l1', priceUsd: 20, feeUsd: 2, sellerEarningsUsd: 18, status: 'pending' })
    expect(data(store, 'tweaks_payments/pay000002')).toMatchObject({ ownerId: 'alice', kind: 'order', ref: 'pay000001', amountUsd: 20, status: 'pending', invoiceId: 'inv1' })
    expect(calls[0]!.body).toMatchObject({ price_amount: 20, order_id: 'pay000002', success_url: 'http://app.test/market/orders?payment=pay000002' })
  })

  it('refuses: not signed in, unknown or paused listings, your own page, a missing seller page, buying twice', async () => {
    expect((await buy((await market({ uid: null })).deps)).status).toBe(401)
    expect((await handleCheckout(post('/checkout', { kind: 'order', listingId: '../x' }), ENV, (await market()).deps)).status).toBe(400)
    expect((await handleCheckout(post('/checkout', { kind: 'order', listingId: 'nope' }), ENV, (await market()).deps)).status).toBe(404)
    expect((await buy((await market({ listing: { status: 'paused' } })).deps)).status).toBe(404)
    expect((await buy((await market({ listing: { priceUsd: 9999 } })).deps)).status).toBe(404)
    expect((await buy((await market({ uid: 'carol' })).deps)).status).toBe(400)
    const gone = await market()
    gone.store.docs.delete('tweaks_projects/p1')
    expect((await buy(gone.deps)).status).toBe(409)
    const twice = await market()
    await twice.store.commit([{ path: 'tweaks_orders/old', data: { buyerId: 'alice', listingId: 'l1', status: 'delivered' } }])
    expect((await buy(twice.deps)).status).toBe(409)
  })
})

describe('a confirmed purchase', () => {
  it('hands the buyer a private copy, credits the seller minus the fee, and counts the sale', async () => {
    const { deps, store } = await market()
    await buy(deps)
    expect((await pay(deps, 'pay000002', 20)).status).toBe(200)
    const order = data(store, 'tweaks_orders/pay000001')!
    expect(order).toMatchObject({ status: 'delivered' })
    const project = String(order.deliveredProjectId)
    expect(data(store, `tweaks_projects/${project}`)).toMatchObject({ ownerId: 'alice', ownerName: 'Alice', name: 'Bakery', isPublic: false, boughtFrom: 'l1', thumbnailUrl: 'https://img.test/t.png' })
    expect(data(store, `tweaks_project_content/${project}`)).toMatchObject({ ownerId: 'alice', isPublic: false, doc: '{"title":"Bakery"}' })
    expect(data(store, 'tweak_users/alice')).toMatchObject({ projectCount: 3, lastProjectOp: project })
    expect(data(store, 'tweak_users/carol')!.earningsUsd).toBe(23)
    expect(data(store, 'tweaks_ledger/sale_pay000001')).toMatchObject({ sellerId: 'carol', type: 'sale', amountUsd: 18, feeUsd: 2 })
    expect(data(store, 'tweaks_listings/l1')!.salesCount).toBe(1)
    expect(data(store, 'tweaks_payments/pay000002')!.status).toBe('paid')
  })

  it('does it only once when the callback repeats', async () => {
    const { deps, store } = await market()
    await buy(deps)
    await pay(deps, 'pay000002', 20)
    await pay(deps, 'pay000002', 20)
    expect(data(store, 'tweak_users/carol')!.earningsUsd).toBe(23)
    expect(data(store, 'tweak_users/alice')!.projectCount).toBe(3)
    expect([...store.docs.keys()].filter((path) => path.startsWith('tweaks_projects/')).length).toBe(2) // the seller's and one copy
  })

  it('delivers nothing until the payment is finished, or when the amount is wrong', async () => {
    const { deps, store } = await market()
    await buy(deps)
    await pay(deps, 'pay000002', 20, 'confirming')
    await pay(deps, 'pay000002', 1)
    expect(data(store, 'tweaks_orders/pay000001')!.status).toBe('pending')
    expect(data(store, 'tweak_users/carol')!.earningsUsd).toBe(5)
  })

  it('flags the order for review, without crediting anyone, when the seller\'s page is gone', async () => {
    const { deps, store } = await market()
    await buy(deps)
    store.docs.delete('tweaks_project_content/p1')
    await pay(deps, 'pay000002', 20)
    expect(data(store, 'tweaks_orders/pay000001')).toMatchObject({ status: 'paid', needsReview: true })
    expect(data(store, 'tweak_users/carol')!.earningsUsd).toBe(5)
    expect(data(store, 'tweaks_payments/pay000002')!.status).toBe('paid')
  })
})

describe('POST /payout', () => {
  const ask = (deps: Deps, body: Record<string, unknown>) => handlePayout(post('/payout', body), ENV, deps)
  const wallet = 'TXyz1234567890abcdef'

  async function seller(balance = 50, uid = 'carol') {
    const kit = testDeps({ uid })
    await kit.store.commit([{ path: 'tweak_users/carol', data: { displayName: 'Carol', earningsUsd: balance } }])
    return kit
  }

  it('holds the amount from the balance, makes a payout record and shows it in the ledger', async () => {
    const { deps, store } = await seller()
    const response = await ask(deps, { wallet, amountUsd: 30 })
    expect(response.status).toBe(200)
    expect(data(store, 'tweak_users/carol')!.earningsUsd).toBe(20)
    expect(data(store, 'tweaks_payouts/pay000001')).toMatchObject({ sellerId: 'carol', amountUsd: 30, wallet, status: 'requested', createdAt: NOW })
    expect(data(store, 'tweaks_ledger/hold_pay000001')).toMatchObject({ type: 'payout-hold', amountUsd: -30 })
  })

  it('refuses: signed out, a bad wallet, under the minimum, over the balance, a second open request', async () => {
    expect((await ask((await seller(50, '')).deps, { wallet, amountUsd: 30 })).status).toBe(401)
    expect((await ask((await seller()).deps, { wallet: 'short', amountUsd: 30 })).status).toBe(400)
    expect((await ask((await seller()).deps, { wallet, amountUsd: 5 })).status).toBe(400)
    expect((await ask((await seller()).deps, { wallet, amountUsd: 80 })).status).toBe(400)
    const kit = await seller(100)
    await ask(kit.deps, { wallet, amountUsd: 30 })
    expect((await ask(kit.deps, { wallet, amountUsd: 30 })).status).toBe(409)
    expect(data(kit.store, 'tweak_users/carol')!.earningsUsd).toBe(70)
  })

  it('cannot be tricked by a stale balance (the profile changed while asking)', async () => {
    const kit = await seller(50)
    const stale = await kit.store.get('tweak_users/carol')
    await kit.store.commit([{ path: 'tweak_users/carol', data: { earningsUsd: 0 }, merge: true }])
    const racing: Store = { ...kit.store, get: async (path) => (path === 'tweak_users/carol' ? stale : kit.store.get(path)), commit: kit.store.commit, find: kit.store.find }
    await expect(ask({ ...kit.deps, store: racing }, { wallet, amountUsd: 30 })).rejects.toThrow()
    expect(data(kit.store, 'tweak_users/carol')!.earningsUsd).toBe(0)
  })
})
