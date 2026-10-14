import { rowTypeName } from '@/features/editor/model/data'
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

const CLIENT = `import axios from 'axios'

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
  const paged = Boolean(api?.pageParam)
  const params = [api?.pageParam && `${JSON.stringify(api.pageParam)}: page`, api?.pageSizeParam && `${JSON.stringify(api.pageSizeParam)}: pageSize`].filter(Boolean).join(', ')
  return `import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { mockData } from '../data/mockData'
import type { ${type} } from '../data/types'
import { api, pickList, USE_MOCK } from './client'

/** One page of ${source.name}, and the next page number (null at the end). */
export type ${type}Page = { items: ${type}[]; nextPage: number | null }

/** Where the real ${source.name} come from (set in the Data panel). */
const ADDRESS = ${JSON.stringify(api?.url ?? '')}
const LIST_PATH = ${JSON.stringify(api?.listPath ?? '')}

const slice = (all: ${type}[], page: number, pageSize: number): ${type}Page => {
  const start = (page - 1) * pageSize
  return { items: all.slice(start, start + pageSize), nextPage: start + pageSize < all.length ? page + 1 : null }
}

/** Fetches one page of ${source.name}: sample data, or the API once VITE_USE_MOCK=false. */
export async function fetch${name}(page = 1, pageSize = 12): Promise<${type}Page> {
  if (USE_MOCK || !ADDRESS) return slice(mockData.${source.name}, page, pageSize)
${paged
    ? `  const { data } = await api.get<unknown>(ADDRESS, { params: { ${params} } })
  const items = pickList<${type}>(data, LIST_PATH)
  return { items, nextPage: items.length === pageSize ? page + 1 : null }`
    : `  // The API returns everything at once: pages are cut here.
  const { data } = await api.get<unknown>(ADDRESS)
  return slice(pickList<${type}>(data, LIST_PATH), page, pageSize)`}
}

/** All ${source.name} (up to 100), for lists that show everything. */
export const use${name} = () =>
  useQuery({ queryKey: ['${source.name}'], queryFn: async () => (await fetch${name}(1, 100)).items })

/** ${name} page by page, for infinite scrolling. */
export const use${name}Infinite = (pageSize = 12) =>
  useInfiniteQuery({
    queryKey: ['${source.name}', 'infinite', pageSize],
    queryFn: ({ pageParam }) => fetch${name}(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
  })
`
}

/** src/data/*, src/api/* and .env.example for the project's data sources (none = no files). */
export function dataFiles(sources: DataSource[]): Record<string, string> {
  if (sources.length === 0) return {}
  const files: Record<string, string> = {
    'src/data/types.ts': typesFile(sources),
    'src/data/mockData.ts': mockFile(sources),
    'src/api/client.ts': CLIENT,
    '.env.example': '# Copy to .env\n# Base address for API calls that start with "/"\nVITE_API_URL=\n# Use the real API instead of the sample data\nVITE_USE_MOCK=true\n',
  }
  for (const source of sources) files[`src/api/${source.name}.ts`] = sourceFile(source)
  return files
}
