import { PLAN_DAYS } from './catalog'
import { fulfilOrder } from './fulfilOrder'
import type { Doc, Store, Write } from './store'

/** A payment document (tweaks_payments/{id}), as the worker reads it. */
export type Payment = { ownerId: string; kind: string; ref: string; months?: number; amountUsd: number; status: string }

/** What a confirmed payment does: the writes (committed together with the payment's own "paid" mark). */
export type Fulfiller = (store: Store, payment: Doc, now: Date, newId: () => string) => Promise<Write[]>

/** The new "Pro until" date: a month (or more) on top of what is left, so paying early never loses days. */
export function planUntil(current: unknown, months: number, now: Date): Date {
  const start = current instanceof Date && current.getTime() > now.getTime() ? current : now
  return new Date(start.getTime() + months * PLAN_DAYS * 24 * 3600 * 1000)
}

/** A plan payment: the person's plan becomes the one they paid for, until a date. */
const fulfilPlan: Fulfiller = async (store, payment, now) => {
  const data = payment.data as unknown as Payment
  const user = await store.get(`tweak_users/${data.ownerId}`)
  const until = planUntil(user?.data.planUntil, data.months ?? 1, now)
  return [{ path: `tweak_users/${data.ownerId}`, data: { plan: data.ref, planUntil: until }, merge: true, ...(user ? { expect: { updateTime: user.updateTime } } : {}) }]
}

/** What each kind of payment does once it is confirmed. */
export const FULFILLERS: Record<string, Fulfiller> = { plan: fulfilPlan, order: fulfilOrder }
