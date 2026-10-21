import { DEFAULT_FILTERS, PRICE_RANGES, SORT_OPTIONS } from "../constants";
import type { PriceRangeId, ProductSort } from "../types";

// Reads the sort order from the address, falling back to the default when it is unknown.
export function parseSort(value: string | null): ProductSort {
  return SORT_OPTIONS.find((option) => option.id === value)?.id ?? DEFAULT_FILTERS.sort;
}

// Reads the price range from the address, falling back to "any price" when it is unknown.
export function parsePrice(value: string | null): PriceRangeId {
  return PRICE_RANGES.find((option) => option.id === value)?.id ?? DEFAULT_FILTERS.price;
}
