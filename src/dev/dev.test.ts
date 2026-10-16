import { describe, expect, it } from 'vitest'
import { declaration, indexFile } from './codeIndex'
import { parseMarkdown, slug } from './markdown'
import { parseEnv, parseFlags, parseRoutes, parseScripts, parseSpec } from './overviewData'

describe('code reference', () => {
  it('recognises what a line exports', () => {
    expect(declaration('export function addPage(a: string) {', false)).toEqual({ name: 'addPage', kind: 'function' })
    expect(declaration('export async function load() {', false)).toEqual({ name: 'load', kind: 'function' })
    expect(declaration('export default function Home() {', true)).toEqual({ name: 'Home', kind: 'component' })
    expect(declaration('export const isMain = (node: unknown) => true', false)).toEqual({ name: 'isMain', kind: 'function' })
    expect(declaration('export const Button = ({ a }: Props) => {', true)).toEqual({ name: 'Button', kind: 'component' })
    expect(declaration('export const FEATURES = [', false)).toEqual({ name: 'FEATURES', kind: 'const' })
    expect(declaration('export type PageDoc = {', false)).toEqual({ name: 'PageDoc', kind: 'type' })
    expect(declaration('const hidden = 1', false)).toBeNull()
    expect(declaration('export { a } from "./a"', false)).toBeNull()
  })

  it('takes the module description and the comment right above each export', () => {
    const file = indexFile('src/x/thing.ts', [
      "import { a } from './a'",
      '',
      '/** What this file is for. */',
      "const LOCAL = 'x'",
      '',
      '/** Adds two numbers. */',
      'export function add(a: number, b: number) {',
      '  return a + b',
      '}',
      '',
      'export const nothingAbove = 1',
      '',
      '// A line comment counts too.',
      'export type Pair = [number, number]',
    ].join('\n'))
    expect(file.summary).toBe('What this file is for.')
    expect(file.entries.map((entry) => [entry.name, entry.kind, entry.doc])).toEqual([
      ['add', 'function', 'Adds two numbers.'], ['nothingAbove', 'const', ''], ['Pair', 'type', 'A line comment counts too.'],
    ])
    expect(file.entries[0]!.signature).toBe('export function add(a: number, b: number)')
    expect(file.entries[0]!.line).toBe(7)
  })

  it('reads multi-line comments', () => {
    const file = indexFile('src/x/y.ts', ['/**', ' * First line', ' * second line', ' */', 'export function f() {}'].join('\n'))
    expect(file.entries[0]!.doc).toBe('First line second line')
  })
})

describe('markdown reader', () => {
  it('reads headings, paragraphs, lists, tables, code and quotes', () => {
    const blocks = parseMarkdown(['# Title `x`', '', 'Some **bold** text', 'on two lines.', '', '- one', '- two', '  continued', '', '1. first', '2. second', '', '| A | B |', '| --- | --- |', '| 1 | 2 |', '', '```ts', 'const a = 1', '```', '', '> quoted', '', '---'].join('\n'))
    expect(blocks.map((block) => block.kind)).toEqual(['heading', 'paragraph', 'list', 'list', 'table', 'code', 'quote', 'rule'])
    expect(blocks[0]).toMatchObject({ level: 1, id: 'title-x' })
    expect(blocks[1]).toMatchObject({ text: 'Some **bold** text on two lines.' })
    expect(blocks[2]).toMatchObject({ ordered: false, items: ['one', 'two continued'] })
    expect(blocks[3]).toMatchObject({ ordered: true, items: ['first', 'second'] })
    expect(blocks[4]).toMatchObject({ head: ['A', 'B'], rows: [['1', '2']] })
    expect(blocks[5]).toMatchObject({ lang: 'ts', text: 'const a = 1' })
  })

  it('makes heading ids that links can point at', () => {
    expect(slug('4. From page to files')).toBe('4-from-page-to-files')
    expect(slug('Reusable components (`model/reuse/`)')).toBe('reusable-components-modelreuse')
  })
})

describe('overview facts', () => {
  it('reads routes, flags, settings, specs and scripts', () => {
    const routes = parseRoutes([
      "      { path: '/', element: page(() => import('@/features/home/HomePage')) },",
      "      { path: '/projects', element: privatePage(() => import('@/features/workspace/DashboardPage')) },",
      "      { path: '/plans', element: flagged('enable_billing', privatePage(() => import('@/features/billing/PlansPage'))) },",
      "      { path: '*', element: page(() => import('./NotFoundPage')) },",
    ].join('\n'))
    expect(routes.map((route) => [route.path, route.access])).toEqual([['/', 'everyone'], ['/projects', 'signed in'], ['/plans', 'switched on by enable_billing'], ['*', 'everyone']])
    expect(routes[0]!.screen).toBe('home/HomePage')
    expect(parseFlags(['export const features = {', '  /** Sign in with Google. */', '  enable_oauth: true,', '  /** Paid plans.', '   Not built. */', '  enable_billing: false,', '}'].join('\n'))).toEqual([
      { name: 'enable_oauth', value: 'true', note: 'Sign in with Google.' }, { name: 'enable_billing', value: 'false', note: 'Paid plans. Not built.' },
    ])
    expect(parseEnv(['interface ImportMetaEnv {', '  /** Firebase settings. */', '  readonly VITE_A?: string', '  readonly VITE_B?: string', '  /** Site address */', '  readonly VITE_SITE_URL?: string', '}'].join('\n'))).toEqual([
      { name: 'VITE_A', note: 'Firebase settings.' }, { name: 'VITE_B', note: 'Firebase settings.' }, { name: 'VITE_SITE_URL', note: 'Site address' },
    ])
    expect(parseSpec('e2e/forms.mjs', ['// Forms: rules.', 'check(1)', 'check(2)'].join('\n'))).toEqual({ name: 'forms', summary: 'Forms: rules.', checks: 2 })
    expect(parseScripts('{"scripts":{"dev":"vite"}}')).toEqual([['dev', 'vite']])
    expect(parseScripts('nope')).toEqual([])
  })
})
