import { rowTypeName } from '@/features/editor/model/data'
import { QUERY_CLIENT, updateSource } from './dataUpdate'
import { itemParts } from './itemAddress'
import type { DataSource, DataValue, FieldType } from '@/features/editor/model/types'

/** Libraries the data files need. */
export const DATA_DEPS = { axios: '^1.12.0', '@tanstack/react-query': '^5.90.0' }

const TS_TYPE: Record<FieldType, string> = { text: 'string', longText: 'string', number: 'number', boolean: 'boolean', image: 'string', date: 'string', url: 'string' }
const pascal = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)
const hasId = (source: DataSource) => source.fields.some((field) => field.name === 'id')

/** Every row gets an id (React lists need a key); one is added when the data has none. */
const rowsWithIds = (source: DataSource): Record<string, DataValue>[] =>
  source.rows.map((row, index) => (hasId(source) ? row : { id: String(index + 1), ...row }))

function typesFile(sources: DataSource[]): string {
  return [
    '/** One row of each data source (from the Data panel). Change a field here and TypeScript shows every place to update. */',
    '',
    ...sources.flatMap((source) => [
      `export type ${rowTypeName(source.name)} = {`,
      ...(hasId(source) ? [] : ['  id: string']),
      ...source.fields.map((field) => `  ${field.name}: ${TS_TYPE[field.type]}`),
      '}', '',
    ]),
  ].join('\n')
}

function mockFile(sources: DataSource[]): string {
  const types = sources.map((source) => rowTypeName(source.name))
  return [
    `import type { ${types.join(', ')} } from './types'`,
    '',
    '/** Sample rows for every data source: used while VITE_USE_MOCK is not "false" (and in tests or stories). */',
    `export const mockData: { ${sources.map((source) => `${source.name}: ${rowTypeName(source.name)}[]`).join('; ')} } = {`,
    ...sources.map((source) => `  ${source.name}: ${JSON.stringify(rowsWithIds(source), null, 2).replace(/\n/g, '\n  ')},`),
    '}',
    '',
  ].join('\n')
}

export const CLIENT = `import axios from 'axios'

/** The API client: set VITE_API_URL in .env for addresses that start with "/". */
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || undefined, timeout: 15000 })

/** Sample data until VITE_USE_MOCK=false is set in .env. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/** Finds the list inside an API answer: pickList(answer, 'data.items'). No path = the answer is the list. */
export function pickList<T>(answer: unknown, path?: string): T[] {
  const found = (path ? path.split('.') : []).reduce<unknown>(
    (value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined),
    answer,
  )
  return Array.isArray(found) ? (found as T[]) : []
}
`

function sourceFile(source: DataSource): string {
  const type = rowTypeName(source.name)
  const name = pascal(source.name)
  const api = source.api
  const item = itemParts(api?.itemUrl)
  const paged = Boolean(api?.pageParam)
  const params = [api?.pageParam && `${JSON.stringify(api.pageParam)}: page`, api?.pageSizeParam && `${JSON.stringify(api.pageSizeParam)}: pageSize`].filter(Boolean).join(', ')
  return `import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { mockData } from '../data/mockData'
import type { ${type} } from '../data/types'
import { api, pickList, USE_MOCK } from './client'
import { queryClient } from './queryClient'

/** One page of ${source.name}, and the next page number (null at the end). */
export type ${type}Page = { items: ${type}[]; nextPage: number | null }

/** Where the real ${source.name} come from (set in the Data panel). */
const ADDRESS = ${JSON.stringify(api?.url ?? '')}
const LIST_PATH = ${JSON.stringify(api?.listPath ?? '')}
${item ? `/** Where ONE ${source.name} lives: the item's id goes between these two parts. */
const ITEM_BEFORE = ${JSON.stringify(item.before)}
const ITEM_AFTER = ${JSON.stringify(item.after)}
const ITEM_PATH = ${JSON.stringify(api?.itemPath ?? '')}
` : ''}${api?.auth ? `
/** The key sent with every request: set ${api.auth.envVar} in your .env file (it is built into the site, so use a key meant for websites). */
const KEY = import.meta.env.${api.auth.envVar} as string | undefined
const HEADERS = KEY ? { ${JSON.stringify(api.auth.header)}: ${JSON.stringify(api.auth.prefix)} + KEY } : undefined
` : ''}
/** Each field of a ${type}, its kind, and where it sits in the API's answer ("rating.rate" = inside rating). */
const FIELDS: { name: string; from: string; kind: string }[] = ${JSON.stringify(source.fields.map((field) => ({ name: field.name, from: field.from ?? field.name, kind: field.type })))}

const read = (item: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), item)

/** One item of the API's answer as a ${type}: the right fields, in the right kinds. */
const toRow = (item: unknown${hasId(source) ? '' : ', index: number'}): ${type} => ({
${hasId(source) ? '' : '  id: String(index + 1),\n'}  ...Object.fromEntries(FIELDS.map(({ name, from, kind }) => {
    const raw = read(item, from)
    const value = kind === 'number' ? Number(raw ?? 0) : kind === 'boolean' ? raw === true || raw === 'true' : Array.isArray(raw) ? raw.join(', ') : kind === 'date' ? String(raw ?? '').slice(0, 10) : String(raw ?? '')
    return [name, value]
  })),
}) as ${type}

const slice = (all: ${type}[], page: number, pageSize: number): ${type}Page => {
  const start = (page - 1) * pageSize
  return { items: all.slice(start, start + pageSize), nextPage: start + pageSize < all.length ? page + 1 : null }
}

${item ? `/** Fetches ONE ${source.name} by id from its own address (detail pages use this instead of loading everything). */
export async function fetch${name}Item(id: string): Promise<${type}> {
  const { data } = await api.get<unknown>(ITEM_BEFORE + encodeURIComponent(id) + ITEM_AFTER${api?.auth ? ', { headers: HEADERS }' : ''})
  return toRow(ITEM_PATH ? read(data, ITEM_PATH) : data${hasId(source) ? '' : ', 0'})
}

` : ''}/** Fetches one page of ${source.name}: sample data, or the API once VITE_USE_MOCK=false. */
export async function fetch${name}(page = 1, pageSize = 12): Promise<${type}Page> {
  if (USE_MOCK || !ADDRESS) return slice(mockData.${source.name}, page, pageSize)
${paged
    ? `  const { data } = await api.get<unknown>(ADDRESS, { ${api?.auth ? 'headers: HEADERS, ' : ''}params: { ${params} } })
  const items = pickList<unknown>(data, LIST_PATH).map(toRow)
  return { items, nextPage: items.length === pageSize ? page + 1 : null }`
    : `  // The API returns everything at once: pages are cut here.
  const { data } = await api.get<unknown>(ADDRESS${api?.auth ? ', { headers: HEADERS }' : ''})
  return slice(pickList<unknown>(data, LIST_PATH).map(toRow), page, pageSize)`}
}

/** All ${source.name} (up to 100), for lists that show everything. */
export const use${name} = (enabled = true) =>
  useQuery({ queryKey: ['${source.name}'], queryFn: async () => (await fetch${name}(1, 100)).items, enabled })

/** One row of ${source.name}: the first, the Nth (1 = first), or the one whose id is in the page address (/products/3 or ?id=3). */
export function use${name}Record(which: 'first' | number | { param: string; value?: string } = 'first') {
  // The page address wins (/products/3 gives value "3"); else ?id=3.
  const wanted = typeof which === 'object' ? which.value ?? new URLSearchParams(window.location.search).get(which.param) : null
${item ? `  // With live data and an id, ask for just that item.
  const single = !USE_MOCK && Boolean(wanted)
  const one = useQuery({ queryKey: ['${source.name}', 'one', wanted], queryFn: () => fetch${name}Item(wanted ?? ''), enabled: single })
` : ''}  const query = use${name}(${item ? '!single' : ''})
${item ? '  if (single) return { ...one }\n' : ''}  const rows = query.data ?? []
  const data: ${type} | undefined = typeof which === 'number'
    ? rows[which - 1] ?? rows[0]
    : wanted !== null ? rows.find((row) => String((row as { id?: unknown }).id ?? '') === wanted) ?? rows[0] : rows[0]
  return { ...query, data }
}

/** ${name} page by page, for infinite scrolling. */
export const use${name}Infinite = (pageSize = 12) =>
  useInfiniteQuery({
    queryKey: ['${source.name}', 'infinite', pageSize],
    queryFn: ({ pageParam }) => fetch${name}(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
  })
${updateSource(source)}`
}

/** src/data/*, src/api/* and .env.example for the project's data sources (none = no files). */
/** The API client and .env.example (shared by data and auth). */
export const clientFiles = (): Record<string, string> => ({
  'src/api/client.ts': CLIENT,
  '.env.example': '# Copy to .env\n# Base address for API calls that start with "/"\nVITE_API_URL=\n# Use the real API (and sign-in) instead of the sample data and demo accounts\nVITE_USE_MOCK=true\n# Feature flags to turn on, e.g. beta,newCheckout\nVITE_FLAGS=\n',
})

export function dataFiles(sources: DataSource[]): Record<string, string> {
  if (sources.length === 0) return {}
  const files: Record<string, string> = {
    'src/data/types.ts': typesFile(sources),
    'src/data/mockData.ts': mockFile(sources),
    ...clientFiles(),
    'src/api/queryClient.ts': QUERY_CLIENT,
  }
  // Keys the APIs need: one line each in .env.example.
  const keys = [...new Set(sources.flatMap((source) => (source.api?.auth ? [source.api.auth.envVar] : [])))]
  if (keys.length) files['.env.example'] += `# Keys for the APIs you connected (never share or commit your real .env)\n${keys.map((key) => `${key}=`).join('\n')}\n`
  for (const source of sources) files[`src/api/${source.name}.ts`] = sourceFile(source)
  return files
}
