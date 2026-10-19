/** A payment's status in plain words, and whether it is still moving. */
export type PaymentStatus = 'pending' | 'paid' | 'underpaid' | 'failed' | 'expired' | 'refunded' | 'mismatch'

const WORDS: Record<PaymentStatus, { label: string; hint: string; done: boolean }> = {
  pending: { label: 'Waiting for payment', hint: 'We are waiting for the payment to arrive and be confirmed. This can take a few minutes.', done: false },
  paid: { label: 'Paid', hint: 'Thank you. Your payment is confirmed.', done: true },
  underpaid: { label: 'Not enough was sent', hint: 'The amount that arrived is less than the price, so nothing was changed. Contact support with your payment number.', done: true },
  failed: { label: 'Failed', hint: 'The payment did not go through. Nothing was charged to your plan; you can try again.', done: true },
  expired: { label: 'Expired', hint: 'The payment was not made in time. You can start again.', done: true },
  refunded: { label: 'Refunded', hint: 'This payment was refunded.', done: true },
  mismatch: { label: 'Needs a check', hint: 'The amount did not match what was ordered, so nothing was changed. Contact support with your payment number.', done: true },
}

/** Words for a status (anything unknown reads as "waiting"). */
export const paymentWords = (status: string) => WORDS[status as PaymentStatus] ?? WORDS.pending

/** "Pro plan, 3 months" or "Order" for a payment record. */
export function paymentTitle(payment: { kind: string; ref: string; months?: number }): string {
  if (payment.kind === 'plan') return `${payment.ref.charAt(0).toUpperCase()}${payment.ref.slice(1)} plan, ${payment.months ?? 1} month${payment.months === 1 || payment.months === undefined ? '' : 's'}`
  return payment.kind === 'order' ? 'Marketplace purchase' : 'Payment'
}
