import type { Deps } from './deps'
import { json, type Env } from './http'
import { createInvoice } from './nowpayments'
import type { Write } from './store'

/** What a checkout is for. `before` are other records to create together with the payment (an order, for example). */
export type Purchase = { ownerId: string; kind: string; ref: string; months?: number; amountUsd: number; description: string; returnPath: string; before?: Write[] }

/** Records the pending payment (and `before`), starts the hosted checkout, answers { checkoutUrl, reference }; a refusal marks the payment failed. */
export async function startPayment(env: Env, deps: Deps, purchase: Purchase, cors: Record<string, string>, paymentId = deps.newId()): Promise<Response> {
  const now = deps.now()
  const path = `tweaks_payments/${paymentId}`
  const { before, returnPath, description, ...fields } = purchase
  await deps.store.commit([...(before ?? []), { path, data: { ...fields, status: 'pending', provider: 'nowpayments', createdAt: now, updatedAt: now }, expect: { absent: true } }])
  try {
    const invoice = await createInvoice(env, {
      orderId: paymentId, amountUsd: purchase.amountUsd, description,
      callbackUrl: `${env.WORKER_URL}/webhook/nowpayments`, successUrl: `${env.APP_URL}${returnPath}${returnPath.includes('?') ? '&' : '?'}payment=${paymentId}`, cancelUrl: `${env.APP_URL}${returnPath}${returnPath.includes('?') ? '&' : '?'}payment=${paymentId}&cancelled=1`,
    }, deps.fetchFn)
    await deps.store.commit([{ path, data: { invoiceId: invoice.id, updatedAt: deps.now() }, merge: true }])
    return json({ checkoutUrl: invoice.url, reference: paymentId }, 200, cors)
  } catch (error) {
    await deps.store.commit([{ path, data: { status: 'failed', note: (error as Error).message.slice(0, 200), updatedAt: deps.now() }, merge: true }])
    return json({ error: 'The payment service is not available right now. Please try again later.' }, 502, cors)
  }
}
