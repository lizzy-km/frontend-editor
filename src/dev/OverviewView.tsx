import { useEffect, useState } from 'react'
import { seoRouteFor } from '@/config/seoRoutes'
import { DOC_FILES, E2E_SPECS, README, SKILLS, SMALL_FILES, SOURCES, TEST_FILES, readFile } from './docsFiles'
import { parseEnv, parseFlags, parseRoutes, parseScripts, parseSpec, type EnvVar, type Flag, type Route, type Spec } from './overviewData'
import over from './OverviewView.module.css'

type Facts = { routes: Route[]; flags: Flag[]; env: EnvVar[]; scripts: [string, string][]; specs: Spec[] }

async function loadFacts(): Promise<Facts> {
  const [router, features, env, pkg] = await Promise.all(['/router.tsx', '/features.config.ts', '/vite-env.d.ts', '/package.json'].map((end) => readFile(SMALL_FILES, end)))
  const specs = await Promise.all(Object.entries(E2E_SPECS).sort(([a], [b]) => a.localeCompare(b)).filter(([path]) => !/\/(run|browser|guide-shots)\.mjs$/.test(path)).map(async ([path, load]) => parseSpec(path, await load())))
  return { routes: parseRoutes(router!), flags: parseFlags(features!), env: parseEnv(env!), scripts: parseScripts(pkg!), specs }
}

/** The facts about the app in one place: numbers, routes, switches, settings, commands, end-to-end checks. */
export function OverviewView() {
  const [facts, setFacts] = useState<Facts | null>(null)
  useEffect(() => {
    let alive = true
    loadFacts().then((value) => { if (alive) setFacts(value) })
    return () => { alive = false }
  }, [])
  if (!facts) return <p className={over.muted}>Reading the project…</p>

  const numbers: [string, number][] = [['Source files', Object.keys(SOURCES).length], ['Unit test files', TEST_FILES.length], ['End-to-end checks', facts.specs.reduce((sum, spec) => sum + spec.checks, 0)], ['Docs', Object.keys(DOC_FILES).length + Object.keys(README).length], ['Rule files', Object.keys(SKILLS).length]]
  return (
    <div className={over.grid}>
      <section className={over.numbers}>{numbers.map(([label, value]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}</section>

      <section>
        <h3>Screens (routes)</h3>
        <table>
          <thead><tr><th>Address</th><th>Screen</th><th>Who</th><th>Search engines</th></tr></thead>
          <tbody>{facts.routes.map((route) => (
            <tr key={route.path}><td><code>{route.path}</code></td><td>{route.screen || 'not found page'}</td><td>{route.access}</td><td>{seoRouteFor(route.path)?.index ? 'indexed' : 'not indexed'}</td></tr>
          ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Feature flags (config/features.config.ts)</h3>
        <table><tbody>{facts.flags.map((flag) => <tr key={flag.name}><td><code>{flag.name}</code></td><td><b>{flag.value}</b></td><td>{flag.note}</td></tr>)}</tbody></table>
      </section>

      <section>
        <h3>Settings (.env, see .env.example)</h3>
        <table><tbody>{facts.env.map((item) => <tr key={item.name}><td><code>{item.name}</code></td><td>{item.note}</td></tr>)}</tbody></table>
      </section>

      <section>
        <h3>Commands</h3>
        <table><tbody>{facts.scripts.map(([name, command]) => <tr key={name}><td><code>npm run {name}</code></td><td><code>{command}</code></td></tr>)}</tbody></table>
        <p className={over.muted}>Before a feature is merged: <code>npx tsc -b && npx eslint . && npx vitest run && npx vite build</code>, then <code>npm run e2e</code> with the dev server on port 5317.</p>
      </section>

      <section>
        <h3>End-to-end checks (e2e/)</h3>
        <table>
          <thead><tr><th>Spec</th><th>What it covers</th><th>Checks</th></tr></thead>
          <tbody>{facts.specs.map((spec) => <tr key={spec.name}><td><code>{spec.name}</code></td><td>{spec.summary}</td><td>{spec.checks}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  )
}
