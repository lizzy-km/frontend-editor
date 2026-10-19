import type { DataSource } from '@/features/editor/model/types'
import { itemAddress } from '@/features/editor/model/updateClicks'
import { itemParts } from './itemAddress'

/** The one cache of API answers (main.tsx provides it, and a click that changes data refreshes it). */
export const QUERY_CLIENT = `import { QueryClient } from '@tanstack/react-query'

/** Caches API answers; data stays fresh for a minute before it is fetched again. */
export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
`

/** The "update one item" function written into each source's file (a click that changes data calls it). */
export const updateName = (sourceName: string) => `update${sourceName.charAt(0).toUpperCase() + sourceName.slice(1)}Item`

/** `updateProductsItem(id, { liked: true })`: sample data while VITE_USE_MOCK is on, else a PATCH to the item's address; then the lists refresh. */
export function updateSource(source: DataSource): string {
  const api = source.api
  const parts = itemParts(itemAddress(api))
  return `
/** Where ONE ${source.name} lives, to send a change to: the item's id goes between these two parts. */
const UPDATE_BEFORE = ${JSON.stringify(parts?.before ?? '')}
const UPDATE_AFTER = ${JSON.stringify(parts?.after ?? '')}

/** A typed value from what a click sent (a typed word like "12" or "yes" becomes the field's own kind). */
function coerce(name: string, value: unknown) {
  const kind = FIELDS.find((field) => field.name === name)?.kind
  if (kind === 'number') return Number(value) || 0
  if (kind === 'boolean') return value === true || /^(true|yes|1)$/i.test(String(value))
  return String(value)
}

/** The changes as the API expects them: each value goes where the API keeps it ("rating.rate" is inside rating). */
function toBody(changes: Record<string, unknown>) {
  const body: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(changes)) {
    const path = (FIELDS.find((field) => field.name === name)?.from ?? name).split('.')
    let at = body
    for (const key of path.slice(0, -1)) at = (at[key] ??= {}) as Record<string, unknown>
    at[path[path.length - 1]!] = value
  }
  return body
}

/** Changes some fields of ONE ${source.name} (sample data while VITE_USE_MOCK is not "false", else a PATCH request), then refreshes its lists. */
export async function ${updateName(source.name)}(id: string, changes: Record<string, string | number | boolean>): Promise<void> {
  const typed = Object.fromEntries(Object.entries(changes).map(([name, value]) => [name, coerce(name, value)]))
  if (USE_MOCK || !UPDATE_BEFORE) {
    const row = mockData.${source.name}.find((item) => String(item.id) === String(id))
    if (row) Object.assign(row, typed)
  } else {
    await api.patch(UPDATE_BEFORE + encodeURIComponent(id) + UPDATE_AFTER, toBody(typed)${api?.auth ? ', { headers: HEADERS }' : ''})
  }
  await queryClient.invalidateQueries({ queryKey: ['${source.name}'] })
}
`
}
