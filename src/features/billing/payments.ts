import type { PlanId } from './plans'

/**
 * Payments are pluggable. Today only crypto is planned. A provider starts a
 * checkout; it must NEVER change the user's plan itself — a trusted server
 * (webhook -> Firebase Admin SDK) does that after the payment is confirmed,
 * because firestore.rules refuse plan changes from the browser.
 */
export type PaymentMethod = 'crypto'

export type Checkout = {
  /** Where to send the user to pay (hosted crypto checkout page). */
  checkoutUrl: string
  /** Id to match the provider's webhook to this user and plan. */
  reference: string
}

export interface PaymentProvider {
  method: PaymentMethod
  /** Plain-words name shown on the button. */
  label: string
  startCheckout: (planId: PlanId, uid: string) => Promise<Checkout>
}

/** Placeholder until a crypto processor (and its server webhook) is chosen. */
const cryptoProvider: PaymentProvider = {
  method: 'crypto',
  label: 'Pay with crypto',
  startCheckout: async () => {
    throw new Error('Crypto payments are coming soon.')
  },
}

export const PAYMENT_PROVIDERS: Record<PaymentMethod, PaymentProvider> = { crypto: cryptoProvider }
