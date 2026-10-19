/** The prices and limits of the billing worker, read from its own catalog.ts so this page cannot go out of date. */
export type Constant = { name: string; value: string; note: string }

/** Every exported constant of the worker's catalog with the comment right above it. */
export function parseCatalog(source: string): Constant[] {
  return [...source.matchAll(/\/\*\*\s*((?:(?!\*\/)[\s\S])*?)\s*\*\/\s*export const (\w+)\s*(?::[^=\n]+)?=\s*([^\n]+)/g)]
    .filter((match) => !match[3]!.includes('=>'))
    .map((match) => ({ note: match[1]!.replace(/\s*\n\s*\*?\s*/g, ' ').replace(/^\*\s*/, ''), name: match[2]!, value: match[3]!.trim() }))
}

const CATALOG = import.meta.glob('/workers/billing/src/catalog.ts', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>

/** Reads the worker's catalog (empty when the file is not there). */
export async function loadCatalog(): Promise<Constant[]> {
  const load = Object.values(CATALOG)[0]
  return load ? parseCatalog(await load()) : []
}
