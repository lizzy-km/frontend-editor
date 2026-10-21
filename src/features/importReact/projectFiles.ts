/** The text files of a project, by path from the project root ("src/main.tsx"). */
export type Files = Record<string, string>

const SCRIPT_EXT = ['.tsx', '.ts', '.jsx', '.js']
const ENTRIES = ['src/main.tsx', 'src/main.jsx', 'src/index.tsx', 'src/index.jsx', 'src/main.ts', 'src/main.js']

export const isBareSpecifier = (spec: string) => !spec.includes("=") && !spec.includes("?") && !spec.includes(")") && !spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('@/') && !spec.startsWith('~/')

/** Joins and cleans a path ("src/a/../b.ts" -> "src/b.ts"). */
export function normalizePath(path: string): string {
  const out: string[] = []
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return out.join('/')
}

const folderOf = (path: string) => path.split('/').slice(0, -1).join('/')

/** Which file an import points at (alias "@/" is src/, then extensions, then index files), or null when it is a library or missing. */
export function resolveImport(from: string, spec: string, files: Files): string | null {
  if (isBareSpecifier(spec)) return null
  const base = spec.startsWith('@/') ? `src/${spec.slice(2)}` : spec.startsWith('/') ? spec.slice(1) : `${folderOf(from)}/${spec}`
  const path = normalizePath(base)
  if (path in files) return path
  for (const ext of SCRIPT_EXT) if (`${path}${ext}` in files) return `${path}${ext}`
  for (const ext of SCRIPT_EXT) if (`${path}/index${ext}` in files) return `${path}/index${ext}`
  return null
}

/** A real library name ("react", "@scope/pkg", "react-router/dom") or a path ("./a", "@/a", "../b"): no spaces, "=", quotes or tags, so text that only looks like an import is ignored. */
export function isPlausibleSpecifier(spec: string): boolean {
  if (/[\s=<>'"`{}()]/.test(spec) || spec.length > 214) return false
  return isBareSpecifier(spec) ? /^(@[a-z0-9~._-]+\/)?[a-z0-9~._-]+(\/[\w.~-]+)*$/i.test(spec) : true
}

/** The import specifiers a source file uses: `import x from "a"`, `import "a"`, `export … from "a"` and `import("a")`. */
export function importsOf(source: string): string[] {
  const found = new Set<string>()
  for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)(['"])([^'"\n]+)\1/g)) if (isPlausibleSpecifier(match[2]!)) found.add(match[2]!)
  return [...found]
}

export type Detected = { ok: true; entry: string; dependencies: Record<string, string> } | { ok: false; reason: string }

/** Is this a Vite + React project Tweak can try to open (a package.json with react, and a main file)? */
export function detectReactApp(files: Files): Detected {
  const raw = files['package.json']
  if (!raw) return { ok: false, reason: 'There is no package.json in this folder.' }
  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
  try { pkg = JSON.parse(raw) as typeof pkg } catch { return { ok: false, reason: 'The package.json is not valid.' } }
  const dependencies = { ...pkg.devDependencies, ...pkg.dependencies }
  if (!dependencies.react) return { ok: false, reason: 'This project does not use React.' }
  const entry = ENTRIES.find((path) => path in files)
  return entry ? { ok: true, entry, dependencies } : { ok: false, reason: 'There is no src/main.tsx to start from.' }
}
