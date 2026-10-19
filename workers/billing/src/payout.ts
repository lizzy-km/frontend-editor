import { MIN_PAYOUT_USD, money } from './catalog'
import type { Deps } from './deps'
import { corsHeaders, json, type Env } from './http'

/**
 * POST /payout   Authorization: Bearer <Firebase ID token>   body { wallet, amountUsd }
 * A seller asks to be paid out. The amount is taken off their balance right away (held), a payout record is made for a person to pay
 * by hand, and the ledger shows the hold. One open request at a time. A person later sets the payout's status to "paid" (or "cancelled",
 * and adds the money back to the balance) in the Firebase console.
 */
export async function handlePayout(request: Request, env: Env, deps: Deps): Promise<Response> {
  const cors = corsHeaders(request, env)
  const uid = await deps.userOf(request)
  if (!uid) return json({ error: 'Please sign in again.' }, 401, cors)
  const body = (await request.json().catch(() => ({}))) as { wallet?: string; amountUsd?: number }
  const wallet = String(body.wallet ?? '').trim()
  const amount = money(Number(body.amountUsd))
  if (wallet.length < 10 || wallet.length > 120 || /\s/.test(wallet)) return json({ error: 'Enter the wallet address to pay to.' }, 400, cors)
  if (!(amount >= MIN_PAYOUT_USD)) return json({ error: `The smallest payout is $${MIN_PAYOUT_USD}.` }, 400, cors)

  const user = await deps.store.get(`tweak_users/${uid}`)
  const balance = Number(user?.data.earningsUsd ?? 0)
  if (!user || amount > balance) return json({ error: 'That is more than your balance.' }, 400, cors)
  const open = await deps.store.find('tweaks_payouts', 'sellerId', uid)
  if (open.some((payout) => payout.data.status === 'requested')) return json({ error: 'You already have a payout waiting. It must be paid first.' }, 409, cors)

  const payoutId = deps.newId()
  const now = deps.now()
  await deps.store.commit([
    { path: `tweaks_payouts/${payoutId}`, data: { sellerId: uid, amountUsd: amount, wallet, status: 'requested', createdAt: now, updatedAt: now }, expect: { absent: true } },
    { path: `tweak_users/${uid}`, data: { earningsUsd: money(balance - amount) }, merge: true, expect: { updateTime: user.updateTime } },
    { path: `tweaks_ledger/hold_${payoutId}`, data: { sellerId: uid, type: 'payout-hold', payoutId, amountUsd: -amount, createdAt: now }, expect: { absent: true } },
  ])
  return json({ payoutId }, 200, cors)
}
