import { DEFAULT_MAX_PROJECTS } from '@/config/app.config'

export type PlanId = 'free' | 'pro'

export type Plan = {
  id: PlanId
  name: string
  maxProjects: number
  /** Monthly price in USD, paid in crypto (future). */
  priceUsd: number
  perks: string[]
}

/**
 * Plans. The limits here MUST match `maxProjects()` in firestore.rules —
 * the rules are what actually enforce them.
 */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free', name: 'Free', maxProjects: DEFAULT_MAX_PROJECTS, priceUsd: 0,
    perks: [`Save up to ${DEFAULT_MAX_PROJECTS} pages`, 'Download as file or picture', 'Share pages publicly'],
  },
  pro: {
    id: 'pro', name: 'Pro', maxProjects: 100, priceUsd: 6,
    perks: ['Save up to 100 pages', 'Everything in Free', 'Early access to the marketplace'],
  },
}

export const planFor = (id: string | undefined): Plan => PLANS[(id as PlanId) ?? 'free'] ?? PLANS.free
