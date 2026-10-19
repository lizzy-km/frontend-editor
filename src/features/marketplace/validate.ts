import { LISTING_PRICE, MIN_PAYOUT_USD, type ListingInput } from './types'

/** What is wrong with a listing the seller filled in, in plain words (null = fine). The rules refuse the same things. */
export function listingProblem(input: Pick<ListingInput, 'title' | 'description' | 'priceUsd'>): string | null {
  if (!input.title.trim()) return 'Give your page a title.'
  if (input.title.trim().length > 100) return 'The title can be up to 100 letters.'
  if (input.description.trim().length > 1000) return 'The description can be up to 1000 letters.'
  if (!Number.isFinite(input.priceUsd) || input.priceUsd < LISTING_PRICE.min || input.priceUsd > LISTING_PRICE.max) return `The price must be between $${LISTING_PRICE.min} and $${LISTING_PRICE.max}.`
  return null
}

/** What is wrong with a payout request (null = fine). `balance` is what the seller has now. */
export function payoutProblem(wallet: string, amountUsd: number, balance: number): string | null {
  const address = wallet.trim()
  if (address.length < 10 || address.length > 120 || /\s/.test(address)) return 'Enter the wallet address to pay to, without spaces.'
  if (!Number.isFinite(amountUsd) || amountUsd < MIN_PAYOUT_USD) return `The smallest payout is $${MIN_PAYOUT_USD}.`
  if (amountUsd > balance) return 'That is more than your balance.'
  return null
}
