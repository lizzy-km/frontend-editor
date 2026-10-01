import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react'
import { analyticsAllowed } from './consent'

/** Page ids never leave the browser: "/edit/abc123" -> "/edit/:projectId". */
export function withoutIds(url: string): string {
  return url.replace(/\/(edit|p)\/[^/?#]+/, (_, screen: string) => `/${screen}/:projectId`)
}

const beforeSend = (event: BeforeSendEvent): BeforeSendEvent | null =>
  analyticsAllowed() ? { ...event, url: withoutIds(event.url) } : null

/**
 * Vercel Web Analytics (cookieless page views) for the Vercel deployment.
 * Production builds only; follows the same opt-out and Do Not Track rules
 * as Firebase Analytics.
 */
export function VercelAnalytics() {
  if (!import.meta.env.PROD) return null
  return <Analytics beforeSend={beforeSend} />
}
