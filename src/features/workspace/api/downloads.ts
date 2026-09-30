import { runTransaction } from 'firebase/firestore/lite'
import { planFor } from '@/features/billing/plans'
import { firestore } from '@/lib/firebase'
import { projectRef, userRef } from './refs'

/**
 * Month as a number, e.g. 202609 for September 2026. UTC, because the
 * security rules count by request.time, which is UTC.
 */
export const downloadPeriod = (date = new Date()) => date.getUTCFullYear() * 100 + date.getUTCMonth() + 1

/** First day of next month (when the count starts again), for the message. */
export function nextReset(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
}

export type DownloadUsage = { used: number; max: number | null }

export class DownloadLimitError extends Error {
  constructor(public readonly max: number) {
    super(`You've used this page's ${max} downloads for this month.`)
  }
}

/** Downloads used this month, from a project's stored fields (old months count as 0). */
export function usedThisMonth(period: unknown, count: unknown, now = new Date()): number {
  return period === downloadPeriod(now) && typeof count === 'number' ? count : 0
}

/** How many downloads this page has used this month, and the plan's limit. */
export async function readDownloadUsage(projectId: string, uid: string): Promise<DownloadUsage> {
  return runTransaction(firestore(), async (transaction) => {
    const [project, user] = await Promise.all([transaction.get(projectRef(projectId)), transaction.get(userRef(uid))])
    const data = project.data() ?? {}
    return { used: usedThisMonth(data.downloadPeriod, data.downloadCount), max: planFor(user.data()?.plan).maxDownloadsPerMonth }
  })
}

/**
 * Uses one download. Must succeed BEFORE the file is made. The rules only
 * allow +1 per request, within the plan's monthly limit, by the owner.
 */
export async function recordDownload(projectId: string, uid: string): Promise<DownloadUsage> {
  return runTransaction(firestore(), async (transaction) => {
    const [project, user] = await Promise.all([transaction.get(projectRef(projectId)), transaction.get(userRef(uid))])
    const data = project.data() ?? {}
    const max = planFor(user.data()?.plan).maxDownloadsPerMonth
    const used = usedThisMonth(data.downloadPeriod, data.downloadCount)
    if (max !== null && used >= max) throw new DownloadLimitError(max)
    transaction.update(projectRef(projectId), { downloadPeriod: downloadPeriod(), downloadCount: used + 1 })
    return { used: used + 1, max }
  })
}
