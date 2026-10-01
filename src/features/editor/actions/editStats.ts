import type { AnalyticsEvents, EditAction } from '@/features/analytics/events'
import { track } from '@/features/analytics/track'

/** Same window as the doc store's undo coalescing: one drag or typing burst = one count. */
const COALESCE_MS = 800
let last = { key: '', at: 0 }

/** False while the same continuous edit (same key, close together) goes on. */
function isNewStep(coalesceKey?: string): boolean {
  const now = Date.now()
  const merging = Boolean(coalesceKey && coalesceKey === last.key && now - last.at < COALESCE_MS)
  last = { key: coalesceKey ?? '', at: now }
  return !merging
}

/** Counts an edit for usage stats (the kind only, never the content). */
export function countEdit(action: EditAction, coalesceKey?: string): void {
  if (isNewStep(coalesceKey)) track('edit', { action })
}

/** Counts a code edit (which code box, never the code). */
export function countCodeEdit(scope: AnalyticsEvents['edit_code']['scope'], coalesceKey?: string): void {
  if (isNewStep(coalesceKey)) track('edit_code', { scope })
}
