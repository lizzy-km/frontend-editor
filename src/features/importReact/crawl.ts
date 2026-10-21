import type { Compiled } from './compile'
import { startRunner, type Runner, type Snapshot } from './runner'
import { titleOf } from './toDoc'

/** The key an app keeps its signed-in person under (a convention of the React project prompt), and the person the importer signs in as. */
export const SESSION_KEY = 'tweak:session'
const importSession = () => ({ key: SESSION_KEY, value: JSON.stringify({ token: 'tweak-import', user: { id: 'import-admin', name: 'Admin', email: 'admin@example.com', role: 'admin' } }) })

export type CrawledPage = {
  /** The address people open (a concrete one, for example /shop/1). */
  path: string
  /** The route it belongs to (/shop/:id), or the path itself. */
  pattern: string
  title: string
  html: string
  /** Only signed-in people reach it. */
  private: boolean
}

/** What the crawl is doing, for a progress screen. */
export type CrawlEvent =
  | { kind: 'start'; signedIn: boolean }
  | { kind: 'visit'; path: string; visits: number; found: number }
  | { kind: 'page'; path: string; title: string; private: boolean }

export type CrawlResult = { pages: CrawledPage[]; styles: string[]; warnings: string[] }

const MAX_PAGES = 30
const LOGIN = /\/(log-?in|sign-?in|auth)(\/|$)/i

const pathOf = (address: string) => address.split(/[?#]/)[0]!.replace(/(.)\/$/, '$1') || '/'
const regexFor = (pattern: string) => new RegExp(`^${pattern.split('/').map((part) => (part.startsWith(':') ? '[^/]+' : part.replace(/[^\w-]/g, '\\$&'))).join('/')}$`)

/** The route a concrete address belongs to ("/shop/3" -> "/shop/:id"), or the address itself. */
export const patternFor = (path: string, routes: string[]) => routes.find((route) => route.includes(':') && regexFor(route).test(path)) ?? path

/** A concrete address for each route to visit first: static ones as they are, changing ones filled with "1" (links found later replace them). */
export const seedsFor = (routes: string[]) => [...new Set(routes.filter((route) => !route.includes('*')).map((route) => route.replace(/:[A-Za-z_]\w*/g, '1')))]

/**
 * Opens the app in a locked frame and visits every page it can find: the routes of its router and the links it shows. A page that sends a
 * visitor to the login is a members-only page: it is visited again as a signed-in person (when the app keeps its session under SESSION_KEY).
 */
export async function crawlApp(compiled: Compiled, dependencies: Record<string, string>, onEvent: (event: CrawlEvent) => void): Promise<CrawlResult> {
  const warnings: string[] = []
  const pages = new Map<string, CrawledPage>()
  const styles = new Set<string>()
  const protectedPaths = new Set<string>()
  const seenPatterns = new Set<string>()
  let routes: string[] = []
  let visits = 0

  const visit = async (runner: Runner, path: string, signedIn: boolean): Promise<Snapshot | null> => {
    try {
      onEvent({ kind: 'visit', path, visits: ++visits, found: pages.size })
      if (path !== '/' || signedIn) await runner.goto(path)
      const snap = await runner.capture()
      for (const style of snap.styles) styles.add(style)
      routes = snap.routes.length > routes.length ? snap.routes : routes
      const final = pathOf(snap.path)
      if (final !== pathOf(path)) { if (!signedIn && LOGIN.test(final)) protectedPaths.add(pathOf(path)); return snap.links.length ? { ...snap, html: '' } : null }
      const pattern = patternFor(final, snap.routes)
      if (seenPatterns.has(pattern) && pattern !== final) return snap
      seenPatterns.add(pattern)
      const crawled = { path: final, pattern, title: snap.title || '', html: snap.html, private: signedIn && protectedPaths.has(final) }
      pages.set(final, crawled)
      onEvent({ kind: 'page', path: final, title: titleOf(crawled), private: crawled.private })
      return snap
    } catch (error) { warnings.push(`Could not open ${path}: ${(error as Error).message}`); return null }
  }

  const walk = async (runner: Runner, first: string[], signedIn: boolean) => {
    const queue = [...first]
    const visited = new Set<string>()
    while (queue.length && pages.size < MAX_PAGES) {
      const path = pathOf(queue.shift()!)
      if (visited.has(path)) continue
      visited.add(path)
      if (!signedIn && pages.has(path)) continue
      const pattern = patternFor(path, routes)
      if (pattern !== path && seenPatterns.has(pattern)) continue // one example page for each changing address (/shop/:id)
      const snap = await visit(runner, path, signedIn)
      if (snap) for (const link of snap.links.map(pathOf)) if (!visited.has(link) && !pages.has(link) && !seenPatterns.has(patternFor(link, routes))) queue.push(link)
    }
  }

  onEvent({ kind: 'start', signedIn: false })
  const visitor = await startRunner(compiled, { start: '/', session: null, dependencies })
  try {
    const home = await visitor.capture()
    routes = home.routes
    await walk(visitor, ['/', ...seedsFor(home.routes)], false)
  } finally { visitor.close() }

  if (protectedPaths.size) {
    if (!JSON.stringify(compiled.modules).includes(SESSION_KEY)) warnings.push(`The members-only pages (${[...protectedPaths].join(', ')}) were not opened: the app should keep its session under "${SESSION_KEY}".`)
    else {
      onEvent({ kind: 'start', signedIn: true })
      const member = await startRunner(compiled, { start: '/', session: importSession(), dependencies })
      try { await walk(member, [...protectedPaths, ...seedsFor(routes).filter((path) => !pages.has(path))], true) } finally { member.close() }
    }
  }
  if (!pages.size) warnings.push('No page could be opened.')
  return { pages: [...pages.values()], styles: [...styles], warnings }
}
