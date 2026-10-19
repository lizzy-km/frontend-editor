import { DEFAULT_DOWNLOADS_PER_MONTH, DEFAULT_MAX_PROJECTS } from '@/config/app.config'

export type PlanId = 'free' | 'pro'

export type Plan = {
  id: PlanId
  name: string
  maxProjects: number
  /** Downloads (and code copies) per page per calendar month; null = unlimited. */
  maxDownloadsPerMonth: number | null
  /** Monthly price in USD, paid in crypto (future). */
  priceUsd: number
  perks: string[]
}

/**
 * Plans. The limits here MUST match `maxProjects()` / `maxDownloads()` in firestore.rules —
 * the rules are what actually enforce them.
 */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free', name: 'Free', maxProjects: DEFAULT_MAX_PROJECTS, maxDownloadsPerMonth: DEFAULT_DOWNLOADS_PER_MONTH, priceUsd: 0,
    perks: [`Save up to ${DEFAULT_MAX_PROJECTS} pages`, `${DEFAULT_DOWNLOADS_PER_MONTH} downloads per page each month`, 'Share pages publicly'],
  },
  pro: {
    id: 'pro', name: 'Pro', maxProjects: 100, maxDownloadsPerMonth: null, priceUsd: 6,
    perks: ['Save up to 100 pages', 'Unlimited downloads', 'Early access to the marketplace'],
  },
}

/** When a paid plan ends, in milliseconds (a Firestore timestamp or a date); null = it does not end (or there is none). */
export function planEnd(data: { planUntil?: unknown } | undefined): number | null {
  const value = data?.planUntil as { toMillis?: () => number } | Date | undefined
  if (value instanceof Date) return value.getTime()
  return typeof value?.toMillis === 'function' ? value.toMillis() : null
}

/** The plan someone has right now: a paid plan whose end date has passed counts as Free (the rules do the same). */
export function effectivePlan(data: { plan?: unknown; planUntil?: unknown } | undefined, now = Date.now()): PlanId {
  const id = String(data?.plan ?? 'free')
  const end = planEnd(data)
  if (id !== 'free' && end !== null && end <= now) return 'free'
  return id in PLANS ? (id as PlanId) : 'free'
}

export const planFor = (id: string | undefined): Plan => PLANS[(id as PlanId) ?? 'free'] ?? PLANS.free
