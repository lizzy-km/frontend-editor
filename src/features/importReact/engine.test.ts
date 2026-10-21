import { describe, expect, it } from 'vitest'
import { compileProject, readIndexHtml, transpile } from './compile'
import { ALWAYS, externalUrl, importMap, splitSpecifier } from './externals'
import { detectReactApp, importsOf, isPlausibleSpecifier, normalizePath, resolveImport, type Files } from './projectFiles'
import { runnerDocument } from './runner'

const PROJECT: Files = {
  'package.json': JSON.stringify({ dependencies: { react: '^19.3.0', 'react-router': '^7.9.0', axios: '^1.12.0' }, devDependencies: { vite: '^8.3.1' } }),
  'index.html': '<!doctype html><html lang="fr"><head><title>Shop</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter"><link rel="icon" href="/x.svg"></head><body><div id="root"></div></body></html>',
  'src/main.tsx': "import { createRoot } from 'react-dom/client'\nimport { RouterProvider } from 'react-router/dom'\nimport '@/styles/global.css'\nimport { router } from '@/app/router'\ncreateRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)",
  'src/app/router.tsx': "import { createBrowserRouter } from 'react-router'\nimport styles from './App.module.css'\nimport logo from './logo.png'\nimport data from '../data/items.json'\nconst mode: string = import.meta.env.VITE_USE_MOCK\nexport const router = createBrowserRouter([{ path: '/', lazy: async () => ({ Component: (await import('@/features/home/Home')).default }) }])\nexport const x = [styles, logo, data, mode]",
  'src/app/App.module.css': '.box { color: red }',
  'src/styles/global.css': 'body { margin: 0 }',
  'src/data/items.json': '[{"id":1}]',
  'src/features/home/Home.tsx': 'export default function Home() { return <h1>Hi</h1> }',
}

describe('finding files', () => {
  it('cleans paths and resolves imports like the project would (alias, relative, extensions, index files)', () => {
    expect(normalizePath('src/a/../b/./c.ts')).toBe('src/b/c.ts')
    expect(resolveImport('src/main.tsx', '@/app/router', PROJECT)).toBe('src/app/router.tsx')
    expect(resolveImport('src/app/router.tsx', './App.module.css', PROJECT)).toBe('src/app/App.module.css')
    expect(resolveImport('src/app/router.tsx', '../data/items.json', PROJECT)).toBe('src/data/items.json')
    expect(resolveImport('src/x.ts', './features/home/Home', PROJECT)).toBe('src/features/home/Home.tsx')
    expect(resolveImport('src/x.ts', './features/home', { ...PROJECT, 'src/features/home/index.ts': '' })).toBe('src/features/home/index.ts')
    expect(resolveImport('src/x.ts', 'react', PROJECT)).toBeNull()
    expect(resolveImport('src/x.ts', './missing', PROJECT)).toBeNull()
  })

  it('lists the imports of a file in every form', () => {
    const source = "import a from 'a'\nimport { b } from \"b\"\nimport 'c.css'\nexport { d } from 'd'\nconst e = await import('e')\nconst f = require('f')"
    expect(importsOf(source).sort()).toEqual(['a', 'b', 'c.css', 'd', 'e', 'f'])
  })

  it('ignores text that only looks like an import (a library name has no spaces, equals signs or tags)', () => {
    const source = [
      `const a = 'Download from " type="'`,
      `const b = 'import " x"'`,
      "const c = require('a=b')",
      "import real from 'react'",
      "import rel from './ok'",
    ].join('\n')
    expect(importsOf(source).sort()).toEqual(['./ok', 'react'])
    for (const good of ['react', 'react-router/dom', '@hookform/resolvers/zod', '@/app/router', './a', '../b/c', 'zod']) expect(isPlausibleSpecifier(good), good).toBe(true)
    for (const bad of [' type=', 'a b', 'x=y', '<div>', 'a"b', '', '@/a b']) expect(isPlausibleSpecifier(bad), bad).toBe(false)
  })

  it('knows a React app from something else', () => {
    expect(detectReactApp(PROJECT)).toMatchObject({ ok: true, entry: 'src/main.tsx' })
    expect(detectReactApp({})).toMatchObject({ ok: false })
    expect(detectReactApp({ 'package.json': '{ nope' })).toMatchObject({ ok: false })
    expect(detectReactApp({ 'package.json': '{"dependencies":{"vue":"3"}}' })).toMatchObject({ ok: false, reason: expect.stringContaining('React') })
    expect(detectReactApp({ 'package.json': '{"dependencies":{"react":"19"}}' })).toMatchObject({ ok: false, reason: expect.stringContaining('main') })
  })
})

describe('compiling the project', () => {
  const compiled = compileProject(PROJECT)
  if ('error' in compiled) throw new Error(compiled.error)

  it('turns TypeScript and JSX into plain code and Vite variables into a variable the runner gives', () => {
    expect(compiled.modules['src/features/home/Home.tsx']!.code).toContain('jsx')
    expect(compiled.modules['src/features/home/Home.tsx']!.code).not.toContain('<h1>')
    expect(compiled.modules['src/app/router.tsx']!.code).toContain('__env.VITE_USE_MOCK')
    expect(transpile('a.ts', 'const x: number = import.meta.env.MODE')).toContain('__env.MODE')
  })

  it('sorts files by kind, and records where each import points', () => {
    expect(compiled.modules['src/app/App.module.css']!.type).toBe('cssmodule')
    expect(compiled.modules['src/styles/global.css']!.type).toBe('css')
    expect(compiled.modules['src/data/items.json']!.type).toBe('json')
    const router = compiled.modules['src/app/router.tsx']!
    expect(router.deps['./App.module.css']).toBe('src/app/App.module.css')
    expect(router.deps['@/features/home/Home']).toBe('src/features/home/Home.tsx')
    expect(router.deps['./logo.png']).toBe('')
    expect(compiled.warnings.join(' ')).toContain('logo.png')
  })

  it('lists the libraries the code names, and what index.html says', () => {
    expect(compiled.externals).toEqual(['react-dom/client', 'react-router', 'react-router/dom'])
    expect(compiled.entry).toBe('src/main.tsx')
    expect(compiled.html).toEqual({ title: 'Shop', lang: 'fr', links: ['https://fonts.googleapis.com/css2?family=Inter'] })
    expect(readIndexHtml(undefined)).toEqual({ title: '', lang: 'en', links: [] })
  })

  it('says which file is broken', () => {
    expect(compileProject({ ...PROJECT, 'src/features/home/Home.tsx': 'export default function ( {' })).toMatchObject({ error: expect.stringContaining('Home.tsx') })
    expect(compileProject({})).toMatchObject({ error: expect.any(String) })
  })
})

describe('libraries and the runner page', () => {
  const dependencies = { react: '^19.3.0', 'react-router': '^7.9.0', '@hookform/resolvers': '^5.2.0' }

  it('loads each library at the version the project asks for, with one shared React', () => {
    expect(splitSpecifier('react-router/dom')).toEqual({ name: 'react-router', subpath: '/dom' })
    expect(splitSpecifier('@hookform/resolvers/zod')).toEqual({ name: '@hookform/resolvers', subpath: '/zod' })
    expect(externalUrl('react', dependencies)).toBe('https://esm.sh/react@^19.3.0')
    expect(externalUrl('react-router/dom', dependencies)).toBe('https://esm.sh/react-router@^7.9.0/dom?external=react,react-dom')
    expect(externalUrl('zod', {})).toBe('https://esm.sh/zod?external=react,react-dom')
    expect(Object.keys(importMap(['react-router'], dependencies)).sort()).toEqual([...ALWAYS, 'react-router'].sort())
    expect(Object.keys(importMap(['react-router', 'Google', 'type='], dependencies))).not.toContain('Google')
    expect(importMap(['zod'], { zod: '^4.1.0' }).zod).toBe('https://esm.sh/zod@^4.1.0?external=react,react-dom')
  })

  it('builds a page that cannot be broken out of by the project\'s own text', () => {
    const base = compileProject(PROJECT) as Exclude<ReturnType<typeof compileProject>, { error: string }>
    const tricky = { ...base, modules: { ...base.modules, 'src/x.tsx': { type: 'js' as const, code: 'const s = "</script><script>alert(1)</script>"', deps: {} } } }
    const html = runnerDocument(tricky, { start: '/', session: null, dependencies })
    expect(html).toContain('type="importmap"')
    expect(html.match(/<\/script>/g)).toHaveLength(3) // importmap, cfg and the runner, nothing from the project
    expect(html).not.toContain('<script>alert(1)')
  })
})
