import type { Listing } from './types'

export type Sort = 'new' | 'cheap' | 'dear' | 'popular'

const SORTS: Record<Sort, (a: Listing, b: Listing) => number> = {
  new: (a, b) => b.createdAt - a.createdAt, cheap: (a, b) => a.priceUsd - b.priceUsd, dear: (a, b) => b.priceUsd - a.priceUsd, popular: (a, b) => b.salesCount - a.salesCount,
}

/** The listings that match every word typed (in the title, description or seller's name), in the chosen order. */
export function shown(listings: Listing[], search: string, sort: Sort): Listing[] {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  return listings.filter((item) => words.every((word) => `${item.title} ${item.description} ${item.sellerName}`.toLowerCase().includes(word))).sort(SORTS[sort])
}
