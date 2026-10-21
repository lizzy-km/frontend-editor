import { transform } from 'sucrase'
import { detectReactApp, importsOf, isBareSpecifier, resolveImport, type Files } from './projectFiles'

export type ModuleType = 'js' | 'css' | 'cssmodule' | 'json'
/** One compiled file: its code, and for every import where it points (a file of the project, "" for a file we skip, or a library). */
export type CompiledModule = { type: ModuleType; code: string; deps: Record<string, string> }

export type Compiled = {
  entry: string
  modules: Record<string, CompiledModule>
  /** Libraries the project imports (react, react-router, zod…), by the name used in the code. */
  externals: string[]
  /** What index.html says: the page title, language and web font stylesheets. */
  html: { title: string; lang: string; links: string[] }
  warnings: string[]
}

const typeOf = (path: string): ModuleType | null =>
  /\.module\.css$/.test(path) ? 'cssmodule' : /\.css$/.test(path) ? 'css' : /\.json$/.test(path) ? 'json' : /\.(tsx?|jsx?)$/.test(path) ? 'js' : null

/** Vite's `import.meta.env` becomes a plain variable the runner provides; `import.meta.glob` is not supported. */
const withoutImportMeta = (source: string) => source.replace(/import\.meta\.env\b/g, '__env').replace(/import\.meta\.glob\s*\(/g, '__glob(')

/** TypeScript and JSX to plain JavaScript (CommonJS, so the runner can load files one by one). */
export function transpile(path: string, source: string): string {
  return transform(withoutImportMeta(source), { transforms: ['typescript', 'jsx', 'imports'], jsxRuntime: 'automatic', production: true, filePath: path }).code
}

/** The page title, language and font stylesheets from index.html. */
export function readIndexHtml(html: string | undefined): Compiled['html'] {
  const text = html ?? ''
  const links = [...text.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]).filter((tag) => /rel=["']stylesheet["']/i.test(tag)).flatMap((tag) => /href=["'](https?:[^"']+)["']/i.exec(tag)?.[1] ?? [])
  return { title: /<title>([^<]*)<\/title>/i.exec(text)?.[1]?.trim() ?? '', lang: /<html\b[^>]*\blang=["']([^"']+)["']/i.exec(text)?.[1] ?? 'en', links }
}

/** Compiles every source, style and data file under src/, and works out the libraries it needs. */
export function compileProject(files: Files): Compiled | { error: string } {
  const found = detectReactApp(files)
  if (!found.ok) return { error: found.reason }
  const modules: Record<string, CompiledModule> = {}
  const externals = new Set<string>()
  const warnings: string[] = []
  for (const [path, source] of Object.entries(files)) {
    const type = path.startsWith('src/') ? typeOf(path) : null
    if (!type) continue
    const deps: Record<string, string> = {}
    if (type === 'js') {
      if (/import\.meta\.glob/.test(source)) warnings.push(`${path} uses import.meta.glob, which is not supported.`)
      for (const spec of importsOf(source)) {
        const target = resolveImport(path, spec, files)
        if (isBareSpecifier(spec)) externals.add(spec)
        else deps[spec] = target && typeOf(target) ? target : ''
        if (!isBareSpecifier(spec) && !deps[spec]) warnings.push(`${path} imports "${spec}", which was left out (pictures and other files are not read).`)
      }
    }
    try { modules[path] = { type, code: type === 'js' ? transpile(path, source) : source, deps } } catch (error) { return { error: `${path} could not be read: ${(error as Error).message}` } }
  }
  return { entry: found.entry, modules, externals: [...externals].sort(), html: readIndexHtml(files['index.html']), warnings }
}
