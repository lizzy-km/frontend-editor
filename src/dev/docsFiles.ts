/**
 * Everything the developer docs page reads, straight from the repository, so it is never out of date.
 * This module is only reachable from the /dev route, which exists only in development: none of it is in a production build.
 */
type Loader = () => Promise<string>

const base = (path: string) => path.split('/').pop() ?? path

export const DOC_FILES = import.meta.glob('/docs/*.md', { query: '?raw', import: 'default' }) as Record<string, Loader>
export const README = import.meta.glob('/README.md', { query: '?raw', import: 'default' }) as Record<string, Loader>
export const SKILLS = import.meta.glob('/.claude/skills/*/SKILL.md', { query: '?raw', import: 'default' }) as Record<string, Loader>
export const SOURCES = import.meta.glob(['/src/**/*.{ts,tsx,js}', '!/src/**/*.test.ts', '!/src/dev/**'], { query: '?raw', import: 'default' }) as Record<string, Loader>
export const TEST_FILES = Object.keys(import.meta.glob('/src/**/*.test.ts'))
export const E2E_SPECS = import.meta.glob('/e2e/*.mjs', { query: '?raw', import: 'default' }) as Record<string, Loader>
export const SMALL_FILES = import.meta.glob(['/package.json', '/src/vite-env.d.ts', '/src/app/router.tsx', '/src/config/features.config.ts'], { query: '?raw', import: 'default' }) as Record<string, Loader>

/** Diagram pictures (addresses) and their Mermaid sources, by file name without the extension. */
const pictures = import.meta.glob('/docs/diagrams/*.svg', { query: '?url', import: 'default', eager: true }) as Record<string, string>
const pngs = import.meta.glob('/docs/diagrams/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>
const sources = import.meta.glob('/docs/diagrams/*.mmd', { query: '?raw', import: 'default' }) as Record<string, Loader>

const byName = <T,>(files: Record<string, T>) => Object.fromEntries(Object.entries(files).map(([path, value]) => [base(path).replace(/\.\w+$/, ''), value]))
export const DIAGRAM_SVG = byName(pictures)
export const DIAGRAM_PNG = byName(pngs)
export const DIAGRAM_SOURCE = byName(sources)

/** Reads one of the loaders by (part of) its path. */
export async function readFile(files: Record<string, Loader>, endsWith: string): Promise<string> {
  const key = Object.keys(files).find((path) => path.endsWith(endsWith))
  try { return key ? await files[key]!() : '' } catch { return '' } // a file the dev server won't serve just shows nothing
}
