import type { Env } from './http'

/** NOWPayments (crypto) hosted invoices: https://documenter.getpostman.com/view/7907941/2s93JusNJt */
const base = (env: Pick<Env, 'NOWPAYMENTS_SANDBOX'>) => (env.NOWPAYMENTS_SANDBOX === 'false' ? 'https://api.nowpayments.io/v1' : 'https://api-sandbox.nowpayments.io/v1')

export type InvoiceRequest = { orderId: string; amountUsd: number; description: string; successUrl: string; cancelUrl: string; callbackUrl: string }

/** Starts a hosted checkout. The processor calls `callbackUrl` as the payment moves along. */
export async function createInvoice(env: Pick<Env, 'NOWPAYMENTS_SANDBOX' | 'NOWPAYMENTS_API_KEY'>, request: InvoiceRequest, fetchFn: typeof fetch = fetch): Promise<{ id: string; url: string }> {
  const response = await fetchFn(`${base(env)}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: request.amountUsd, price_currency: 'usd', order_id: request.orderId, order_description: request.description,
      ipn_callback_url: request.callbackUrl, success_url: request.successUrl, cancel_url: request.cancelUrl,
    }),
  })
  if (!response.ok) {
    const said = ((await response.json().catch(() => ({}))) as { message?: string; code?: string }).message ?? ''
    throw new Error(`The payment service refused the checkout (${response.status}${said ? `: ${said.slice(0, 160)}` : ''})`)
  }
  const answer = (await response.json()) as { id?: string | number; invoice_url?: string }
  if (!answer.invoice_url || answer.id === undefined) throw new Error('The payment service sent no checkout address')
  return { id: String(answer.id), url: answer.invoice_url }
}

/** The same object with every key sorted (also inside objects): the processor signs this form. */
export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value as object).sort().map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]))
  return value
}

const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')

/** HMAC-SHA512 of the sorted JSON, the way the processor signs its callbacks. */
export async function signatureOf(secret: string, body: unknown): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(JSON.stringify(sortKeys(body)))))
}

/** Is this callback really from the processor? (Compared in constant time.) */
export async function verifySignature(secret: string, body: unknown, header: string | null): Promise<boolean> {
  if (!secret || !header) return false
  const expected = await signatureOf(secret, body)
  if (expected.length !== header.length) return false
  let difference = 0
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ header.toLowerCase().charCodeAt(i)
  return difference === 0
}

export type PaymentState = 'pending' | 'paid' | 'underpaid' | 'failed' | 'expired' | 'refunded'

/** The processor's status word as ours. Only "finished" (the money has arrived) counts as paid. */
export function stateOf(status: string): PaymentState {
  if (status === 'finished') return 'paid'
  if (status === 'partially_paid') return 'underpaid'
  if (status === 'failed') return 'failed'
  if (status === 'expired') return 'expired'
  if (status === 'refunded') return 'refunded'
  return 'pending' // waiting, confirming, confirmed, sending
}
