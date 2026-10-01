import type { createBrowserRouter } from 'react-router-dom'
import { track } from './track'
import { startWebVitals } from './webVitals'

type AppRouter = ReturnType<typeof createBrowserRouter>
type RouterState = AppRouter['state']

/** Most errors per visit (one broken loop must not flood the stats). */
const MAX_ERRORS = 10

/** "/edit/abc123" -> "/edit/:projectId": screens are counted, never page ids. */
export function screenPath(state: Pick<RouterState, 'matches' | 'location'>): string {
  const path = state.matches.map((match) => match.route.path).filter(Boolean).at(-1)
  return path ?? state.location.pathname
}

/** The screen being shown (for speed reports, which arrive later). */
let currentScreen = ''

/** One page_view per screen change (not per search/hash change). */
function trackPageViews(router: AppRouter): () => void {
  let last = ''
  const send = (state: RouterState) => {
    if (state.navigation.state !== 'idle') return
    const path = screenPath(state)
    if (path === last) return
    last = path
    currentScreen = path
    track('page_view', { page_path: path, page_title: document.title })
  }
  send(router.state)
  return router.subscribe(send)
}

/** Unexpected errors as GA "exception" events: message only, shortened. */
function trackErrors(): () => void {
  let sent = 0
  const report = (reason: unknown) => {
    if (sent++ >= MAX_ERRORS) return
    const message = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason)
    track('exception', { description: message.slice(0, 150), fatal: false })
  }
  const onError = (event: ErrorEvent) => report(event.error ?? event.message)
  const onRejection = (event: PromiseRejectionEvent) => report(event.reason)
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
  }
}

/** Starts page-view, error and speed (Web Vitals) tracking for the whole app; returns a stop function. */
export function startAutoTracking(router: AppRouter): () => void {
  const stopPages = trackPageViews(router)
  const stopErrors = trackErrors()
  startWebVitals(() => currentScreen)
  return () => {
    stopPages()
    stopErrors()
  }
}

/** For crash screens (route errors): a fatal exception. */
export function trackCrash(error: unknown): void {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  track('exception', { description: message.slice(0, 150), fatal: true })
}
