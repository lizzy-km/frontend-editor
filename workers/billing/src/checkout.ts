import { MAX_MONTHS, PLAN_PRICES_USD, money } from './catalog'
import { checkoutOrder } from './checkoutOrder'
import type { Deps } from './deps'
import { corsHeaders, json, type Env } from './http'
import { startPayment } from './startPayment'

type Body = { kind?: string; planId?: string; months?: number; listingId?: string }

/**
 * POST /checkout   Authorization: Bearer <Firebase ID token>
 *   body { kind: "plan", planId: "pro", months?: 1..12 }   or   { kind: "order", listingId }
 * The plan changes (or the page is handed over) only later, when the processor's confirmed callback reaches /webhook/nowpayments.
 */
export async function handleCheckout(request: Request, env: Env, deps: Deps): Promise<Response> {
  const cors = corsHeaders(request, env)
  const uid = await deps.userOf(request)
  if (!uid) return json({ error: 'Please sign in again.' }, 401, cors)
  const body = (await request.json().catch(() => ({}))) as Body
  if (body.kind === 'order') return checkoutOrder(env, deps, uid, body.listingId, cors)
  if (body.kind !== 'plan') return json({ error: 'Nothing to buy here.' }, 400, cors)
  const price = PLAN_PRICES_USD[body.planId ?? '']
  const months = Number.isInteger(body.months) ? Math.min(Math.max(body.months!, 1), MAX_MONTHS) : 1
  if (!price) return json({ error: 'Unknown plan.' }, 400, cors)
  return startPayment(env, deps, {
    ownerId: uid, kind: 'plan', ref: body.planId!, months, amountUsd: money(price * months), returnPath: '/plans',
    description: `Tweak ${body.planId} plan, ${months} month${months === 1 ? '' : 's'}`,
  }, cors)
}
