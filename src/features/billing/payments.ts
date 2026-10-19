import { authService } from '@/features/auth/auth.store'
import type { PlanId } from './plans'

/**
 * Checkout is the billing Worker's job (workers/billing). From here a checkout can only be STARTED: the Worker records the
 * payment, the processor's hosted page takes the money, and the plan changes later, on the server, after the payment is
 * confirmed (firestore.rules refuse plan changes from the browser).
 */
const BILLING_URL = (import.meta.env.VITE_BILLING_URL ?? '').replace(/\/$/, '')

/** Is a billing Worker set up (VITE_BILLING_URL)? */
export const checkoutAvailable = () => Boolean(BILLING_URL)

export type Checkout = {
  /** Where to send the person to pay (the processor's hosted page). */
  checkoutUrl: string
  /** The payment's id: the Plans page uses it to show how the payment is going. */
  reference: string
}

export type CheckoutOrder = { kind: 'plan'; planId: PlanId; months: number }

type Deps = { token: () => Promise<string | null>; fetchFn: typeof fetch; url: string }
const realDeps = (): Deps => ({ token: async () => (await authService()).getIdToken(), fetchFn: (...args) => fetch(...args), url: BILLING_URL })

/** Asks the billing Worker for a hosted checkout. Throws an error whose words can be shown as they are. */
export async function startCheckout(order: CheckoutOrder, deps: Deps = realDeps()): Promise<Checkout> {
  if (!deps.url) throw new Error('Paid plans are not switched on yet.')
  const token = await deps.token()
  if (!token) throw new Error('Please sign in again to continue.')
  const response = await deps.fetchFn(`${deps.url}/checkout`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(order),
  }).catch(() => { throw new Error('The payment service could not be reached. Check your connection and try again.') })
  const body = (await response.json().catch(() => ({}))) as Partial<Checkout> & { error?: string }
  if (!response.ok || !body.checkoutUrl || !body.reference) throw new Error(body.error ?? 'The checkout could not be started. Please try again.')
  return { checkoutUrl: body.checkoutUrl, reference: body.reference }
}
