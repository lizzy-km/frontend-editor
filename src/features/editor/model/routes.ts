/**
 * Page addresses with a changing part: /products/:id, /user/:name/posts.
 * A segment starting with ":" matches any value and is called by that name.
 */
export type Params = Record<string, string>

const PARAM = /^:[A-Za-z_]\w*$/

export const isParamSegment = (segment: string) => PARAM.test(segment)
export const isDynamicPath = (path: string) => path.split('/').some(isParamSegment)

/** The names of the changing parts: "/user/:id/:tab" -> ["id", "tab"]. */
export const routeParams = (path: string): string[] => path.split('/').filter(isParamSegment).map((segment) => segment.slice(1))

const segments = (path: string) => path.split(/[?#]/)[0]!.split('/').filter(Boolean)

/** The values when an address fits a pattern ({ id: "3" } for /products/3 and /products/:id), else null. */
export function matchPath(pattern: string, actual: string): Params | null {
  const want = segments(pattern)
  const got = segments(actual)
  if (want.length !== got.length) return null
  const params: Params = {}
  for (let index = 0; index < want.length; index++) {
    if (isParamSegment(want[index]!)) params[want[index]!.slice(1)] = decodeURIComponent(got[index]!)
    else if (want[index] !== got[index]) return null
  }
  return params
}

/** The page an address belongs to: an exact address first, then the patterns. */
export function matchPage<T extends { path: string }>(pages: T[], path: string): { page: T; params: Params } | null {
  const exact = pages.find((page) => page.path === path.split(/[?#]/)[0])
  if (exact) return { page: exact, params: {} }
  for (const page of pages) {
    const params = isDynamicPath(page.path) ? matchPath(page.path, path) : null
    if (params) return { page, params }
  }
  return null
}

/** The pattern with real values put in: "/products/:id" + { id: 3 } -> "/products/3". Unknown names are left out. */
export function fillPath(pattern: string, values: Record<string, unknown>): string {
  return pattern.split('/').map((segment) => (isParamSegment(segment) ? encodeURIComponent(String(values[segment.slice(1)] ?? '')) : segment)).join('/')
}

/** TanStack Router writes the changing parts as $id. */
export const tanstackPath = (path: string) => path.split('/').map((segment) => (isParamSegment(segment) ? `$${segment.slice(1)}` : segment)).join('/')

/** A file name part for a pattern ("/products/:id" -> "products-_id"): ":" is not allowed in file names. */
export const fileSafePath = (path: string) => path.split('/').filter(Boolean).map((segment) => (isParamSegment(segment) ? `_${segment.slice(1)}` : segment)).join('-')
