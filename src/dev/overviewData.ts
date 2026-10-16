/** Facts about the app, read out of its own files for the Overview tab (pure functions, so they can be tested). */

export type Route = { path: string; screen: string; access: string }

/** The routes in router.tsx: address, screen file and who can open it. */
export function parseRoutes(source: string): Route[] {
  const routes: Route[] = []
  for (const line of source.split('\n')) {
    const path = /\{\s*path:\s*'([^']+)'/.exec(line)?.[1]
    if (!path) continue
    const flag = /flagged\('(\w+)'/.exec(line)?.[1]
    routes.push({
      path,
      screen: /import\('([^']+)'\)/.exec(line)?.[1]?.replace(/^@\//, '').replace(/^features\//, '') ?? '',
      access: line.includes('import.meta.env.DEV') ? 'development only' : flag ? `switched on by ${flag}` : line.includes('privatePage(') ? 'signed in' : 'everyone',
    })
  }
  return routes
}

export type Flag = { name: string; value: string; note: string }

/** The feature flags and what each one does. */
export function parseFlags(source: string): Flag[] {
  return [...source.matchAll(/\/\*\*\s*([^*]*?)\s*\*\/\s*(enable_\w+):\s*([^,\n]+)/g)].map((match) => ({ note: match[1]!.replace(/\s+/g, ' '), name: match[2]!, value: match[3]!.trim() }))
}

export type EnvVar = { name: string; note: string }

/** The settings the app reads (declared in vite-env.d.ts) with the comment above each; settings without their own comment share the one above. */
export function parseEnv(source: string): EnvVar[] {
  const vars: EnvVar[] = []
  let note = ''
  for (const line of source.split('\n')) {
    const comment =/^\s*\/\*\*\s*(.*?)\s*\*\/\s*$/.exec(line)?.[1]
    if (comment !== undefined) { note = comment; continue }
    const name = /^\s*readonly\s+(VITE_\w+)\??:/.exec(line)?.[1]
    if (name) vars.push({ name, note })
  }
  return vars
}

export type Spec = { name: string; summary: string; checks: number }

/** An end-to-end check: its description (first comment line) and how many things it checks. */
export function parseSpec(path: string, source: string): Spec {
  return { name: path.split('/').pop()!.replace(/\.mjs$/, ''), summary: /^\/\/\s*(.*)$/m.exec(source)?.[1] ?? '', checks: (source.match(/\bcheck\(/g) ?? []).length }
}

/** The npm scripts. */
export function parseScripts(source: string): [string, string][] {
  try { return Object.entries((JSON.parse(source) as { scripts?: Record<string, string> }).scripts ?? {}) } catch { return [] }
}
