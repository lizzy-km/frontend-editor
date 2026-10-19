/**
 * What is for sale, priced HERE (never trust a price from the browser). Keep the plan prices in step with
 * src/features/billing/plans.ts, which only shows them.
 */
export const PLAN_PRICES_USD: Record<string, number> = { pro: 6 }

/** One paid month of a plan. */
export const PLAN_DAYS = 30

/** The most months someone can pay for at once. */
export const MAX_MONTHS = 12

/** The marketplace: the platform keeps this share of every sale. */
export const MARKET_FEE_PERCENT = 10

/** A listing's price must be in this range (the rules enforce the same). */
export const LISTING_PRICE = { min: 1, max: 500 }

/** The least a seller can ask to be paid out at once. */
export const MIN_PAYOUT_USD = 20

/** USD with two decimals, as the processor wants it (avoids 5.999999999). */
export const money = (amount: number) => Math.round(amount * 100) / 100
