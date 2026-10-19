// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { handleCheckout } from './checkout'
import { planUntil } from './fulfil'
import { fromFields, toFields } from './firestoreValues'
import { signatureOf, sortKeys, stateOf, verifySignature } from './nowpayments'
import { ConflictError } from './store'
import { ENV, NOW, testDeps } from './testKit'
import { handleWebhook } from './webhook'

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://worker.test${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://app.test', ...headers }, body: JSON.stringify(body) })
const DAY = 24 * 3600 * 1000

async function callback(deps: ReturnType<typeof testDeps>['deps'], fields: Record<string, unknown>, secret = ENV.NOWPAYMENTS_IPN_SECRET) {
  const body = { payment_status: 'finished', order_id: 'pay000001', price_amount: 6, price_currency: 'usd', payment_id: 99, ...fields }
  return handleWebhook(post('/webhook/nowpayments', body, { 'x-nowpayments-sig': await signatureOf(secret, body) }), ENV, deps)
}

describe('processor helpers', () => {
  it('sorts keys deeply and signs the sorted form, so key order does not matter', async () => {
    expect(JSON.stringify(sortKeys({ b: 1, a: { d: 1, c: [{ z: 1, y: 2 }] } }))).toBe('{"a":{"c":[{"y":2,"z":1}],"d":1},"b":1}')
    expect(await signatureOf('s', { a: 1, b: 2 })).toBe(await signatureOf('s', { b: 2, a: 1 }))
    const signature = await signatureOf('s', { a: 1 })
    expect(await verifySignature('s', { a: 1 }, signature)).toBe(true)
    expect(await verifySignature('s', { a: 2 }, signature)).toBe(false)
    expect(await verifySignature('other', { a: 1 }, signature)).toBe(false)
    expect(await verifySignature('s', { a: 1 }, null)).toBe(false)
    expect(await verifySignature('', { a: 1 }, signature)).toBe(false)
  })

  it('counts only a finished payment as paid', () => {
    expect(['finished', 'waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'failed', 'expired', 'refunded'].map(stateOf))
      .toEqual(['paid', 'pending', 'pending', 'pending', 'pending', 'underpaid', 'failed', 'expired', 'refunded'])
  })

  it('turns Firestore typed values into plain ones and back', () => {
    const data = { name: 'x', n: 3, f: 1.5, yes: true, none: null, when: NOW, list: [1, 'a'], map: { k: 'v' } }
    expect(fromFields(toFields(data) as never)).toEqual(data)
  })

  it('adds paid months on top of what is left of the current plan', () => {
    expect(planUntil(undefined, 1, NOW).getTime()).toBe(NOW.getTime() + 30 * DAY)
    expect(planUntil(new Date(NOW.getTime() + 10 * DAY), 2, NOW).getTime()).toBe(NOW.getTime() + 70 * DAY)
    expect(planUntil(new Date(NOW.getTime() - 5 * DAY), 1, NOW).getTime()).toBe(NOW.getTime() + 30 * DAY)
  })
})

describe('POST /checkout', () => {
  it('records a pending payment priced by the server and returns the hosted checkout', async () => {
    const { deps, store, calls } = testDeps()
    const response = await handleCheckout(post('/checkout', { kind: 'plan', planId: 'pro', months: 3, amountUsd: 0.01 }), ENV, deps)
    expect(await response.json()).toEqual({ checkoutUrl: 'https://pay.test/inv1', reference: 'pay000001' })
    expect(store.docs.get('tweaks_payments/pay000001')!.data).toMatchObject({ ownerId: 'alice', kind: 'plan', ref: 'pro', months: 3, amountUsd: 18, status: 'pending', invoiceId: 'inv1' })
    expect(calls[0]!.body).toMatchObject({ price_amount: 18, price_currency: 'usd', order_id: 'pay000001', ipn_callback_url: 'http://worker.test/webhook/nowpayments' })
    expect(calls[0]!.url).toContain('api-sandbox')
  })

  it('refuses people who are not signed in, unknown plans and other kinds', async () => {
    expect((await handleCheckout(post('/checkout', { kind: 'plan', planId: 'pro' }), ENV, testDeps({ uid: null }).deps)).status).toBe(401)
    expect((await handleCheckout(post('/checkout', { kind: 'plan', planId: 'gold' }), ENV, testDeps().deps)).status).toBe(400)
    expect((await handleCheckout(post('/checkout', { kind: 'gift' }), ENV, testDeps().deps)).status).toBe(400)
  })

  it('keeps months between 1 and 12, and marks the payment failed when the processor refuses', async () => {
    const big = testDeps()
    await handleCheckout(post('/checkout', { kind: 'plan', planId: 'pro', months: 99 }), ENV, big.deps)
    expect(big.store.docs.get('tweaks_payments/pay000001')!.data.months).toBe(12)
    const down = testDeps({ invoiceOk: false })
    const response = await handleCheckout(post('/checkout', { kind: 'plan', planId: 'pro' }), ENV, down.deps)
    expect(response.status).toBe(502)
    expect(down.store.docs.get('tweaks_payments/pay000001')!.data.status).toBe('failed')
  })
})

describe('POST /webhook/nowpayments', () => {
  async function pending(months = 1) {
    const kit = testDeps()
    await handleCheckout(post('/checkout', { kind: 'plan', planId: 'pro', months }), ENV, kit.deps)
    return kit
  }

  it('upgrades the plan once the payment is finished, for a month per payment', async () => {
    const { deps, store } = await pending()
    expect((await callback(deps, { payment_status: 'confirming' })).status).toBe(200)
    expect(store.docs.get('tweak_users/alice')).toBeUndefined()
    expect((await callback(deps, {})).status).toBe(200)
    expect(store.docs.get('tweaks_payments/pay000001')!.data).toMatchObject({ status: 'paid', providerPaymentId: '99' })
    expect(store.docs.get('tweak_users/alice')!.data).toMatchObject({ plan: 'pro', planUntil: new Date(NOW.getTime() + 30 * DAY) })
  })

  it('does not extend the plan again when the same callback repeats', async () => {
    const { deps, store } = await pending()
    await callback(deps, {})
    await callback(deps, {})
    expect(store.docs.get('tweak_users/alice')!.data.planUntil).toEqual(new Date(NOW.getTime() + 30 * DAY))
  })

  it('refuses a wrong signature and ignores a wrong amount, an underpayment and unknown payments', async () => {
    const { deps, store } = await pending()
    expect((await callback(deps, {}, 'wrong-secret')).status).toBe(401)
    expect((await callback(deps, { price_amount: 1 })).status).toBe(200)
    expect(store.docs.get('tweaks_payments/pay000001')!.data.status).toBe('mismatch')
    expect(store.docs.get('tweak_users/alice')).toBeUndefined()
    await callback(deps, { payment_status: 'partially_paid' })
    expect(store.docs.get('tweaks_payments/pay000001')!.data.status).toBe('underpaid')
    expect(store.docs.get('tweak_users/alice')).toBeUndefined()
    expect(await (await callback(deps, { order_id: 'nopenopenope' })).json()).toMatchObject({ ignored: 'unknown payment' })
  })

  it('flags a refund of something already paid for review, without taking the plan away', async () => {
    const { deps, store } = await pending()
    await callback(deps, {})
    await callback(deps, { payment_status: 'refunded' })
    expect(store.docs.get('tweaks_payments/pay000001')!.data).toMatchObject({ status: 'refunded', needsReview: true })
    expect(store.docs.get('tweak_users/alice')!.data.plan).toBe('pro')
  })

  it('answers with an error (so the processor retries) when the payment changed meanwhile', async () => {
    const { deps, store } = await pending()
    const stale = await store.get('tweaks_payments/pay000001')
    await store.commit([{ path: 'tweaks_payments/pay000001', data: { note: 'changed' }, merge: true }])
    const racing = { ...deps, store: { ...store, get: async (path: string) => (path === 'tweaks_payments/pay000001' ? stale : store.get(path)), commit: store.commit, find: store.find } }
    expect((await callback(racing as typeof deps, {})).status).toBe(409)
    expect(ConflictError).toBeDefined()
    expect(store.docs.get('tweak_users/alice')).toBeUndefined()
  })
})
