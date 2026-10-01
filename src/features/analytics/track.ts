import { isAnalyticsConfigured } from '@/lib/firebaseConfig'
import { analyticsAllowed, saveOptOut } from './consent'
import type { AnalyticsClient } from './analyticsClient'
import type { AnalyticsEvent, AnalyticsEvents } from './events'

/**
 * The app's one way to send usage stats. Tiny and always loaded; the SDK is
 * fetched on first use, after the page is idle. Calls made before it is ready
 * keep their order (they wait on the same promise). Does nothing when
 * analytics isn't configured, in `vite dev` (unless VITE_ANALYTICS_IN_DEV=1),
 * or when the person or their browser said no.
 */
const IN_DEV = import.meta.env.VITE_ANALYTICS_IN_DEV === '1'
const ACTIVE = isAnalyticsConfigured && (import.meta.env.PROD || IN_DEV) && import.meta.env.MODE !== 'test'

let client: Promise<AnalyticsClient | null> | null = null
let user: { uid: string | null; properties: Record<string, string> } | null = null

const whenIdle = () => new Promise<void>((resolve) => {
  if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 3000 })
  else setTimeout(resolve, 1500)
})

function load(): Promise<AnalyticsClient | null> {
  client ??= whenIdle()
    .then(() => import('./analyticsClient'))
    .then(({ startAnalytics }) => startAnalytics(IN_DEV))
    .then((started) => {
      if (started && user) started.identify(user.uid, user.properties)
      return started
    })
    .catch(() => null) // ad blockers, offline: the app must not care
  return client
}

const sending = () => ACTIVE && analyticsAllowed()

type Params<K extends AnalyticsEvent> = AnalyticsEvents[K] extends Record<string, never> ? [] : [AnalyticsEvents[K]]

/** Sends one usage event (see events.ts for the list and what each carries). */
export function track<K extends AnalyticsEvent>(name: K, ...params: Params<K>): void {
  if (!sending()) return
  const values = (params[0] ?? {}) as Record<string, unknown>
  void load().then((ready) => ready?.log(name, values))
}

/** Links events to the signed-in account (its id only) and its plan; null on sign-out. */
export function identifyUser(uid: string | null, plan?: string): void {
  user = { uid, properties: { signed_in: uid ? 'yes' : 'no', ...(plan ? { plan } : {}) } }
  if (!sending()) return
  const current = user
  void load().then((ready) => ready?.identify(current.uid, current.properties))
}

/** "Share usage stats" switch: off stops sending right away and is remembered. */
export function setUsageStats(on: boolean): void {
  saveOptOut(!on)
  if (client) void client.then((ready) => ready?.setEnabled(on && analyticsAllowed()))
}

/** Whether there is anything to switch (analytics set up for this build). */
export const usageStatsAvailable = ACTIVE
