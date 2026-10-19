import type { Deps } from './deps'
import { FULFILLERS } from './fulfil'
import { json, type Env } from './http'
import { stateOf, verifySignature } from './nowpayments'
import { ConflictError } from './store'

type Callback = { payment_status?: string; order_id?: string; price_amount?: number | string; price_currency?: string; payment_id?: number | string }

/**
 * POST /webhook/nowpayments: the processor tells us how a payment is going.
 * Checks the signature, the amount and the payment's own record, then (once, even if the call repeats) marks it paid
 * and carries out what it was for. Answers an error when it should be retried.
 */
export async function handleWebhook(request: Request, env: Env, deps: Deps): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Callback | null
  if (!body || !(await verifySignature(env.NOWPAYMENTS_IPN_SECRET, body, request.headers.get('x-nowpayments-sig')))) return json({ error: 'bad signature' }, 401)
  const id = body.order_id ?? ''
  const payment = /^[A-Za-z0-9_-]{8,64}$/.test(id) ? await deps.store.get(`tweaks_payments/${id}`) : null
  if (!payment) return json({ ok: true, ignored: 'unknown payment' }, 200)

  const record = payment.data as { amountUsd: number; status: string; kind: string }
  const raw = String(body.payment_status ?? '')
  const state = stateOf(raw)
  const now = deps.now()
  const same = Math.abs(Number(body.price_amount) - record.amountUsd) < 0.005 && String(body.price_currency ?? '').toLowerCase() === 'usd'
  if (!same) {
    await deps.store.commit([{ path: payment.path, data: { status: 'mismatch', paymentStatus: raw, updatedAt: now }, merge: true }])
    return json({ ok: true, ignored: 'amount does not match' }, 200)
  }
  if (record.status === 'paid') {
    if (state === 'refunded') await deps.store.commit([{ path: payment.path, data: { status: 'refunded', needsReview: true, paymentStatus: raw, updatedAt: now }, merge: true }])
    return json({ ok: true }, 200)
  }
  try {
    const paid = { status: state, paymentStatus: raw, providerPaymentId: String(body.payment_id ?? ''), updatedAt: now, ...(state === 'paid' ? { paidAt: now } : {}) }
    const effects = state === 'paid' ? await (FULFILLERS[record.kind] ?? (async () => []))(deps.store, payment, now) : []
    await deps.store.commit([{ path: payment.path, data: paid, merge: true, expect: { updateTime: payment.updateTime } }, ...effects])
    return json({ ok: true }, 200)
  } catch (error) {
    if (error instanceof ConflictError) return json({ error: 'try again' }, 409)
    throw error
  }
}
