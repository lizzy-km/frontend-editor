import { authService } from '@/features/auth/auth.store'
import type { PlanId } from './plans'

/**
 * Money is the billing Worker's job (workers/billing). From here a checkout can only be STARTED: the Worker records the payment,
 * the processor's hosted page takes the money, and the plan changes (or the purchase is handed over) later, on the server, after
 * the payment is confirmed (firestore.rules refuse those writes from the browser).
 */
const BILLING_URL = (import.meta.env.VITE_BILLING_URL ?? '').replace(/\/$/, '')

/** Is a billing Worker set up (VITE_BILLING_URL)? */
export const checkoutAvailable = () => Boolean(BILLING_URL)

export type Checkout = {
  /** Where to send the person to pay (the processor's hosted page). */
  checkoutUrl: string
  /** The payment's id: the pages use it to show how the payment is going. */
  reference: string
}


/** What is being bought: a plan for some months, or a page from the marketplace. */
export type CheckoutOrder = { kind: 'plan'; planId: PlanId; months: number } | { kind: 'order'; listingId: string }

type Deps = { token: () => Promise<string | null>; fetchFn: typeof fetch; url: string }
const realDeps = (): Deps => ({ token: async () => (await authService()).getIdToken(), fetchFn: (...args) => fetch(...args), url: BILLING_URL })

/** Sends a signed-in request to the billing Worker. Throws an error whose words can be shown as they are. */
export async function callBilling<T>(path: string, body: unknown, deps: Deps = realDeps()): Promise<T> {
  if (!deps.url) throw new Error('Paid plans and the marketplace are not switched on yet.')
  const token = await deps.token()
  if (!token) throw new Error('Please sign in again to continue.')
  const response = await deps.fetchFn(`${deps.url}${path}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).catch(() => { throw new Error('The payment service could not be reached. Check your connection and try again.') })
  const answer = (await response.json().catch(() => ({}))) as T & { error?: string; detail?: string }
  if (!response.ok) throw new Error(`${answer.error ?? 'That did not work. Please try again.'}${answer.detail ? ` (${answer.detail})` : ''}`)
  return answer
}

/** Asks the billing Worker for a hosted checkout. */
export async function startCheckout(order: CheckoutOrder, deps?: Deps): Promise<Checkout> {
  const answer = await callBilling<Partial<Checkout>>('/checkout', order, deps)
  if (!answer.checkoutUrl || !answer.reference) throw new Error('The checkout could not be started. Please try again.')
  return { checkoutUrl: answer.checkoutUrl, reference: answer.reference }
}

/** A seller asks to be paid out; the amount is held from their balance at once. */
export async function requestPayout(wallet: string, amountUsd: number, deps?: Deps): Promise<void> {
  await callBilling('/payout', { wallet, amountUsd }, deps)
}
