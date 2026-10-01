import type { Metric } from 'web-vitals'
import { sending, track } from './track'

/**
 * Core Web Vitals from real visits: loading (LCP, FCP, TTFB), responsiveness
 * (INP) and layout shifts (CLS). The library (~2 kB) loads only when stats
 * are sent. `currentPath` gives the screen the visitor is on (ids removed).
 */
export function startWebVitals(currentPath: () => string): void {
  if (!sending()) return
  const report = (metric: Metric) => track('web_vital', {
    metric_name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    page_path: currentPath(),
  })
  void import('web-vitals')
    .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      for (const listen of [onCLS, onFCP, onINP, onLCP, onTTFB]) listen(report)
    })
    .catch(() => {}) // stats must never break the app
}
