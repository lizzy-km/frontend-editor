import {
  initializeAnalytics, isSupported, logEvent, setAnalyticsCollectionEnabled, setUserId, setUserProperties,
} from 'firebase/analytics'
import { firebaseApp } from '@/lib/firebase'

/**
 * The Firebase Analytics SDK. Loaded lazily by track.ts (never in the first
 * page load) and only when analytics is configured and allowed.
 */
export type AnalyticsClient = {
  log: (name: string, params: Record<string, unknown>) => void
  identify: (uid: string | null, properties: Record<string, string>) => void
  setEnabled: (enabled: boolean) => void
}

/** Starts Analytics, or returns null where the browser can't run it (e.g. cookies blocked). */
export async function startAnalytics(debug: boolean): Promise<AnalyticsClient | null> {
  if (!(await isSupported())) return null
  const analytics = initializeAnalytics(firebaseApp(), {
    config: {
      // Page views are sent by the router listener (one per screen, ids removed from paths).
      send_page_view: false,
      // No advertising features: usage stats only.
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...(debug ? { debug_mode: true } : {}),
    },
  })
  return {
    log: (name, params) => logEvent(analytics, name, params),
    identify: (uid, properties) => {
      setUserId(analytics, uid)
      setUserProperties(analytics, properties)
    },
    setEnabled: (enabled) => setAnalyticsCollectionEnabled(analytics, enabled),
  }
}
