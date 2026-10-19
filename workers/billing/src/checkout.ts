import { MAX_MONTHS, PLAN_PRICES_USD, money } from './catalog'
import type { Deps } from './deps'
import { corsHeaders, json, type Env } from './http'
import { createInvoice } from './nowpayments'

type Body = { kind?: string; planId?: string; months?: number }

/**
 * POST /checkout   Authorization: Bearer <Firebase ID token>   body { kind: "plan", planId: "pro", months?: 1..12 }
 * Records a pending payment, starts a hosted checkout and answers { checkoutUrl, reference }.
 * The plan changes only later, when the processor's confirmed callback reaches /webhook/nowpayments.
 */
export async function handleCheckout(request: Request, env: Env, deps: Deps): Promise<Response> {
  const cors = corsHeaders(request, env)
  const uid = await deps.userOf(request)
  if (!uid) return json({ error: 'Please sign in again.' }, 401, cors)
  const body = (await request.json().catch(() => ({}))) as Body
  if (body.kind !== 'plan') return json({ error: 'Nothing to buy here.' }, 400, cors)
  const price = PLAN_PRICES_USD[body.planId ?? '']
  const months = Number.isInteger(body.months) ? Math.min(Math.max(body.months!, 1), MAX_MONTHS) : 1
  if (!price) return json({ error: 'Unknown plan.' }, 400, cors)

  const id = deps.newId()
  const amountUsd = money(price * months)
  const now = deps.now()
  const path = `tweaks_payments/${id}`
  await deps.store.commit([{ path, data: { ownerId: uid, kind: 'plan', ref: body.planId, months, amountUsd, status: 'pending', provider: 'nowpayments', createdAt: now, updatedAt: now }, expect: { absent: true } }])
  try {
    const invoice = await createInvoice(env, {
      orderId: id, amountUsd, description: `Tweak ${body.planId} plan, ${months} month${months === 1 ? '' : 's'}`,
      callbackUrl: `${env.WORKER_URL}/webhook/nowpayments`, successUrl: `${env.APP_URL}/plans?payment=${id}`, cancelUrl: `${env.APP_URL}/plans?payment=${id}&cancelled=1`,
    }, deps.fetchFn)
    await deps.store.commit([{ path, data: { invoiceId: invoice.id, updatedAt: deps.now() }, merge: true }])
    return json({ checkoutUrl: invoice.url, reference: id }, 200, cors)
  } catch (error) {
    await deps.store.commit([{ path, data: { status: 'failed', note: (error as Error).message.slice(0, 200), updatedAt: deps.now() }, merge: true }])
    return json({ error: 'The payment service is not available right now. Please try again later.' }, 502, cors)
  }
}
