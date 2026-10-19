import { describe, expect, it, vi } from 'vitest'
import { paymentTitle, paymentWords } from './paymentWords'
import { startCheckout } from './payments'

const order = { kind: 'plan', planId: 'pro', months: 3 } as const
const reply = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status }))

describe('starting a checkout', () => {
  it('sends the order with the person\'s token and returns where to pay', async () => {
    const fetchFn = reply({ checkoutUrl: 'https://pay.test/x', reference: 'pay1' })
    const result = await startCheckout(order, { token: async () => 'tok', fetchFn: fetchFn as never, url: 'https://billing.test' })
    expect(result).toEqual({ checkoutUrl: 'https://pay.test/x', reference: 'pay1' })
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, { headers: Record<string, string>; body: string }]
    expect(url).toBe('https://billing.test/checkout')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(JSON.parse(init.body)).toEqual(order)
  })

  it('explains what went wrong in plain words', async () => {
    const deps = (fetchFn: unknown, url = 'https://billing.test', token = 'tok') => ({ token: async () => token as string | null, fetchFn: fetchFn as never, url })
    await expect(startCheckout(order, deps(reply({}), ''))).rejects.toThrow('not switched on')
    await expect(startCheckout(order, { ...deps(reply({})), token: async () => null })).rejects.toThrow('sign in again')
    await expect(startCheckout(order, deps(reply({ error: 'Unknown plan.' }, 400)))).rejects.toThrow('Unknown plan.')
    await expect(startCheckout(order, deps(reply({}, 500)))).rejects.toThrow('could not be started')
    await expect(startCheckout(order, deps(vi.fn(async () => { throw new Error('offline') })))).rejects.toThrow('could not be reached')
  })
})

describe('payment words', () => {
  it('names every status, and treats unknown ones as waiting', () => {
    expect(paymentWords('paid')).toMatchObject({ label: 'Paid', done: true })
    expect(paymentWords('pending').done).toBe(false)
    expect(paymentWords('something-new').label).toBe('Waiting for payment')
    for (const status of ['underpaid', 'failed', 'expired', 'refunded', 'mismatch']) expect(paymentWords(status).done).toBe(true)
  })

  it('titles a payment', () => {
    expect(paymentTitle({ kind: 'plan', ref: 'pro', months: 3 })).toBe('Pro plan, 3 months')
    expect(paymentTitle({ kind: 'plan', ref: 'pro', months: 1 })).toBe('Pro plan, 1 month')
    expect(paymentTitle({ kind: 'order', ref: 'o1' })).toBe('Marketplace purchase')
  })
})
